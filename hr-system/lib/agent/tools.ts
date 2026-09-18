import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getAttendance, getEmployees, getLeaveRequests } from "@/lib/data";
import { inclusiveDays, yearsOfService } from "@/lib/utils";

/**
 * الأدوات التي يستدعيها الوكيل. كل أداة تقرأ من طبقة البيانات فقط
 * ولا تعدّل شيئاً — الوكيل استشاري ولا يملك صلاحية تغيير السجلات.
 */

const searchEmployees = betaZodTool({
  name: "search_employees",
  description:
    "البحث في سجل الموظفين. يمكن التصفية بجزء من الاسم أو القسم أو الحالة الوظيفية. " +
    "بدون أي معامل ترجع كل الموظفين. استخدمها لأي سؤال عن من هم الموظفون أو أعدادهم.",
  inputSchema: z.object({
    name: z.string().optional().describe("جزء من اسم الموظف"),
    department: z.string().optional().describe("اسم القسم، مثل: تقنية المعلومات"),
    status: z
      .enum(["على رأس العمل", "إجازة", "منتدب", "موقوف"])
      .optional()
      .describe("الحالة الوظيفية"),
  }),
  run: async (input) => {
    const all = await getEmployees();
    const matches = all.filter(
      (e) =>
        (!input.name || e.fullName.includes(input.name)) &&
        (!input.department || e.department === input.department) &&
        (!input.status || e.status === input.status),
    );

    return JSON.stringify(
      {
        count: matches.length,
        employees: matches.map((e) => ({
          رقم_الملف: e.fileNumber,
          الاسم: e.fullName,
          المسمى: e.jobTitle,
          القسم: e.department,
          جهة_العمل: e.facility,
          الحالة: e.status,
          نوع_التعاقد: e.contractType,
          سنوات_الخدمة: yearsOfService(e.hireDate),
          رصيد_الإجازة: e.annualLeaveBalance,
        })),
      },
      null,
      1,
    );
  },
});

const getEmployeeDetails = betaZodTool({
  name: "get_employee_details",
  description:
    "تفاصيل موظف واحد عبر رقم الملف (مثل JH-1001). استخدمها بعد search_employees " +
    "عندما تحتاج بيانات التواصل أو تاريخ التعيين بدقة.",
  inputSchema: z.object({
    fileNumber: z.string().describe("رقم الملف الوظيفي"),
  }),
  run: async (input) => {
    const all = await getEmployees();
    const employee = all.find((e) => e.fileNumber === input.fileNumber);
    if (!employee) {
      return `لا يوجد موظف برقم الملف ${input.fileNumber}.`;
    }

    return JSON.stringify(
      {
        رقم_الملف: employee.fileNumber,
        الاسم: employee.fullName,
        المسمى: employee.jobTitle,
        القسم: employee.department,
        جهة_العمل: employee.facility,
        الحالة: employee.status,
        نوع_التعاقد: employee.contractType,
        الجنسية: employee.nationality,
        البريد: employee.email,
        تاريخ_التعيين: employee.hireDate,
        سنوات_الخدمة: yearsOfService(employee.hireDate),
        رصيد_الإجازة: employee.annualLeaveBalance,
      },
      null,
      1,
    );
  },
});

const listLeaveRequests = betaZodTool({
  name: "list_leave_requests",
  description:
    "طلبات الإجازات مع أسماء أصحابها. تُصفّى بالحالة أو النوع. " +
    "استخدمها لأسئلة الاعتماد والطلبات المعلّقة وأرصدة الإجازات المطلوبة.",
  inputSchema: z.object({
    status: z
      .enum(["قيد المراجعة", "معتمدة", "مرفوضة"])
      .optional()
      .describe("حالة الطلب"),
    fileNumber: z.string().optional().describe("رقم ملف موظف محدد"),
  }),
  run: async (input) => {
    const [requests, employees] = await Promise.all([
      getLeaveRequests(),
      getEmployees(),
    ]);
    const byId = new Map(employees.map((e) => [e.id, e]));

    const matches = requests.filter((r) => {
      if (input.status && r.status !== input.status) return false;
      if (input.fileNumber && byId.get(r.employeeId)?.fileNumber !== input.fileNumber) {
        return false;
      }
      return true;
    });

    return JSON.stringify(
      {
        count: matches.length,
        requests: matches.map((r) => ({
          رقم_الطلب: r.id,
          الموظف: byId.get(r.employeeId)?.fullName ?? "غير معروف",
          رقم_الملف: byId.get(r.employeeId)?.fileNumber ?? "—",
          النوع: r.type,
          من: r.startDate,
          إلى: r.endDate,
          عدد_الأيام: inclusiveDays(r.startDate, r.endDate),
          الحالة: r.status,
          السبب: r.reason,
        })),
      },
      null,
      1,
    );
  },
});

const getAttendanceSummary = betaZodTool({
  name: "get_attendance_summary",
  description:
    "كشف الحضور والانصراف ليوم محدد بصيغة YYYY-MM-DD، مع ملخص عددي. " +
    "استخدمها لأسئلة الحضور والتأخير والغياب.",
  inputSchema: z.object({
    date: z.string().describe("التاريخ بصيغة YYYY-MM-DD"),
  }),
  run: async (input) => {
    const [records, employees] = await Promise.all([
      getAttendance(input.date),
      getEmployees(),
    ]);
    if (records.length === 0) {
      return `لا توجد سجلات حضور مسجّلة بتاريخ ${input.date}.`;
    }
    const byId = new Map(employees.map((e) => [e.id, e]));

    const tally = records.reduce<Record<string, number>>((acc, r) => {
      acc[r.state] = (acc[r.state] ?? 0) + 1;
      return acc;
    }, {});

    return JSON.stringify(
      {
        التاريخ: input.date,
        الملخص: tally,
        السجلات: records.map((r) => ({
          الموظف: byId.get(r.employeeId)?.fullName ?? "غير معروف",
          الحضور: r.checkIn ?? "—",
          الانصراف: r.checkOut ?? "—",
          الحالة: r.state,
        })),
      },
      null,
      1,
    );
  },
});

export const hrTools = [
  searchEmployees,
  getEmployeeDetails,
  listLeaveRequests,
  getAttendanceSummary,
];
