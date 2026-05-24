"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStudentAccount, updateStudentStatus, recordPayment, grantCourseAccess } from "@/lib/students";

export async function adminCreateStudent(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const adminUserId = String(formData.get("admin_user_id") ?? "").trim();

  if (!email || !fullName || !adminUserId) {
    redirect("/admin/students?error=Missing+required+fields");
  }

  const result = await createStudentAccount(email, fullName, adminUserId);
  if (!result.success) {
    redirect(`/admin/students?error=${encodeURIComponent(result.error ?? "Failed")}`);
  }

  revalidatePath("/admin/students");
  redirect(`/admin/students?created=${result.studentId}&pwd=${result.password}`);
}

export async function adminToggleStatus(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  await updateStudentStatus(userId, status);
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function adminRecordPayment(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const recordedBy = String(formData.get("recorded_by") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!userId || !amount || !recordedBy) {
    redirect("/admin/students?error=Missing+payment+fields");
  }

  await recordPayment(userId, amount, recordedBy, notes);
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function adminGrantCourse(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const courseKey = String(formData.get("course_key") ?? "").trim();
  const courseName = String(formData.get("course_name") ?? "").trim();
  const grantedBy = String(formData.get("granted_by") ?? "").trim();

  if (!userId || !courseKey || !courseName || !grantedBy) {
    redirect("/admin/students?error=Missing+course+fields");
  }

  await grantCourseAccess(userId, courseKey, courseName, grantedBy);
  revalidatePath("/admin/students");
  redirect("/admin/students");
}
