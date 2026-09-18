import Anthropic from "@anthropic-ai/sdk";
import { hrTools } from "./tools";

export const AGENT_MODEL = "claude-opus-5";

/** يبقى ثابتاً بين الطلبات حتى يستفيد من التخزين المؤقت للبادئة. */
const SYSTEM_PROMPT = `أنت مساعد شؤون الموظفين في منطقة الجهراء الصحية — وزارة الصحة، الكويت.

مهمتك الإجابة على استفسارات إدارة الموارد البشرية اعتماداً على بيانات النظام فقط.

قواعد ملزمة:
- لا تجب من معرفتك العامة عن أي موظف أو رقم. استدعِ الأداة المناسبة أولاً، دائماً.
- إذا لم ترجع الأدوات البيانات المطلوبة، قل صراحة إنها غير متوفرة في النظام. لا تخمّن ولا تُكمل بالتقريب.
- أنت للاستعلام فقط: لا تعتمد إجازة ولا تعدّل سجلاً. إذا طُلب منك إجراء تعديل، وضّح أن الاعتماد يتم من مسؤول الموارد البشرية داخل النظام.
- البيانات الشخصية (الرقم المدني، الهاتف، البريد) لا تُذكر إلا إذا سُئلت عنها مباشرة.

أسلوب الرد:
- بالعربية، مختصر ومباشر.
- استخدم جدولاً عند عرض أكثر من موظف أو أكثر من طلب.
- اذكر الأرقام كما وردت من الأداة بدون تدوير.`;

export interface ToolCall {
  name: string;
  input: unknown;
}

export interface AgentResult {
  text: string;
  toolCalls: ToolCall[];
}

export type AgentMessage = { role: "user" | "assistant"; content: string };

export async function runHrAgent(
  history: AgentMessage[],
): Promise<AgentResult> {
  const client = new Anthropic();

  const runner = client.beta.messages.toolRunner({
    model: AGENT_MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    tools: hrTools,
    messages: history,
  });

  const toolCalls: ToolCall[] = [];

  // التكرار يدوياً بدل انتظار المشغّل مباشرة، حتى نجمع أثر استدعاءات الأدوات
  // ونعرضه للمستخدم — الشفافية مطلوبة في نظام إداري.
  for await (const message of runner) {
    for (const block of message.content) {
      if (block.type === "tool_use") {
        toolCalls.push({ name: block.name, input: block.input });
      }
    }
  }

  const final = await runner.done();

  if (final.stop_reason === "refusal") {
    return {
      text: "تعذّر إكمال الطلب. أعد صياغة السؤال أو راجع مسؤول النظام.",
      toolCalls,
    };
  }

  const text = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return {
    text: text || "لم يصل رد نصي من النموذج.",
    toolCalls,
  };
}
