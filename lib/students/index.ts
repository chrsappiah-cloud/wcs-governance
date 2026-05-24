import { createServiceClient } from "../supabase/server";

export type StudentRecord = {
  id: string;
  student_id: string;
  email: string | null;
  full_name: string | null;
  status: string;
  access_until: string | null;
  created_at: string;
  created_by: string | null;
};

export type StudentWithPayments = StudentRecord & {
  payments: { id: number; amount: number; status: string; created_at: string }[];
  courses: { id: number; course_key: string; course_name: string; granted_at: string }[];
};

function generateStudentId(): string {
  const prefix = "WCS";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export async function createStudentAccount(email: string, fullName: string, createdBy: string) {
  const supabase = await createServiceClient();

  const studentId = generateStudentId();
  const password = generatePassword();

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, is_student: true },
  });

  if (authErr) return { success: false as const, error: authErr.message };

  const { error: studentErr } = await supabase.from("students").insert({
    id: authUser.user.id,
    student_id: studentId,
    email,
    full_name: fullName,
    status: "active",
    created_by: createdBy,
  });

  if (studentErr) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return { success: false as const, error: studentErr.message };
  }

  return {
    success: true as const,
    userId: authUser.user.id,
    studentId,
    password,
  };
}

export async function getStudents() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("students")
    .select("*, student_payments(*), student_courses(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateStudentStatus(studentUserId: string, status: string) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("students")
    .update({ status })
    .eq("id", studentUserId);
  return { success: !error, error: error?.message };
}

export async function recordPayment(
  studentUserId: string,
  amount: number,
  recordedBy: string,
  notes?: string
) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("student_payments").insert({
    student_id: studentUserId,
    amount,
    status: "completed",
    recorded_by: recordedBy,
    notes,
  });
  return { success: !error, error: error?.message };
}

export async function grantCourseAccess(
  studentUserId: string,
  courseKey: string,
  courseName: string,
  grantedBy: string
) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("student_courses").insert({
    student_id: studentUserId,
    course_key: courseKey,
    course_name: courseName,
    granted_by: grantedBy,
  });
  return { success: !error, error: error?.message };
}
