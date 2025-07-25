/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingOrEmpty } from "@/components/ui/LoadingOrEmpty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Edit2 } from "lucide-react";
import React from "react";
import { Avatar } from "@/components/ui/avatar";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone is too short"),
  bio: z.string().max(120, "Bio must be 120 characters or less").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Required"),
  newPassword: z.string().min(6, "At least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

function getPasswordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useSWR(session?.user ? "/api/profile" : null, fetcher, {
    fallbackData: session?.user,
  });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  // Password form
  const {
    register: pwRegister,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
    reset: resetPw,
    watch: pwWatch,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });
  const newPassword = pwWatch("newPassword");
  const pwStrength = getPasswordStrength(newPassword);

  // Update profile handler
  async function onSubmitProfile(data: ProfileForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      mutate("/api/profile");
      toast.success("Profile updated!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  }

  // Change password handler
  async function onSubmitPassword(data: PasswordForm) {
    setPwSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Password change failed");
      toast.success("Password changed!");
      resetPw();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setPwSaving(false);
    }
  }

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({ name: user.name || "", email: user.email || "", phone: user.phone || "", bio: user.bio || "" });
    }
  }, [user, reset]);

  const MotionDiv: React.FC<any> = motion.div;

  return (
    <div className="py-8 px-2 md:px-0 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      {/* Sticky header for mobile */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-2 pt-2 md:pt-0">
        <h2 className="text-2xl font-bold mb-2 md:mb-4 text-center md:text-left">Your Profile</h2>
      </div>
      <LoadingOrEmpty loading={isLoading}>
        {/* Avatar + identity zone */}
        <MotionDiv
          key="avatar-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-2 mb-6"
        >
          <div className="relative group">
            <Avatar
              src={user?.image || "/images/user.jpeg"}
              name={user?.name || undefined}
              size={96}
              aria-label="User avatar"
              className="border-4 border-white shadow-md bg-white w-24 h-24 text-4xl"
            />
            <button
              className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 transition flex items-center"
              title="Edit avatar (coming soon)"
              type="button"
              tabIndex={-1}
            >
              <Edit2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="text-lg font-semibold mt-2">{user?.name}</div>
          <div className="text-gray-500 text-sm">{user?.email}</div>
          {user?.bio && <div className="text-gray-600 text-sm mt-1 text-center max-w-xs">{user.bio}</div>}
          {user?.createdAt && (
            <div className="text-xs text-gray-400 mt-1">Account created: {new Date(user.createdAt).toLocaleDateString()}</div>
          )}
        </MotionDiv>
        {/* Profile info card */}
        <AnimatePresence>
          <MotionDiv
            {...{
              key: "profile-form",
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 20 },
              transition: { duration: 0.3 },
              className: "bg-white rounded-2xl shadow-lg p-6 border border-gray-100",
            } as any}
          >
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>Personal Information</span>
            </h3>
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                <Input id="name" {...register("name")}
                  placeholder="Your name"
                  disabled={saving}
                  autoComplete="name"
                />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <Input id="email" {...register("email")}
                  placeholder="you@example.com"
                  disabled={saving}
                  autoComplete="email"
                />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
                <Input id="phone" {...register("phone")}
                  placeholder="Phone number"
                  disabled={saving}
                  autoComplete="tel"
                />
                {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="bio">Bio / Tagline</label>
                <Input id="bio" {...register("bio")}
                  placeholder="Short bio or tagline (optional)"
                  disabled={saving}
                  maxLength={120}
                />
                {errors.bio && <div className="text-red-500 text-xs mt-1">{errors.bio.message}</div>}
              </div>
              <Button type="submit" disabled={saving} className="w-full mt-2">{saving ? "Saving..." : "Save Changes"}</Button>
            </form>
          </MotionDiv>
          {/* Divider */}
          <div className="h-2" />
          {/* Password change card */}
          <motion.div
            key="password-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>Change Password</span>
            </h3>
            <form onSubmit={handlePwSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">Current Password</label>
                <div className="relative">
                  <Input type={showCurrentPw ? "text" : "password"} id="currentPassword" {...pwRegister("currentPassword")}
                    placeholder="Current password"
                    disabled={pwSaving}
                    autoComplete="current-password"
                  />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrentPw(v => !v)}>
                    {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {pwErrors.currentPassword && <div className="text-red-500 text-xs mt-1">{pwErrors.currentPassword.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="newPassword">New Password</label>
                <div className="relative">
                  <Input type={showNewPw ? "text" : "password"} id="newPassword" {...pwRegister("newPassword")}
                    placeholder="New password"
                    disabled={pwSaving}
                    autoComplete="new-password"
                  />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPw(v => !v)}>
                    {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password strength meter */}
                {newPassword && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden">
                      <div
                        className={`h-2 rounded transition-all duration-300 ${
                          pwStrength === 0 ? "bg-gray-200 w-0" :
                          pwStrength === 1 ? "bg-red-400 w-1/4" :
                          pwStrength === 2 ? "bg-yellow-400 w-2/4" :
                          pwStrength === 3 ? "bg-blue-400 w-3/4" :
                          "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {pwStrength === 0 ? "" :
                        pwStrength === 1 ? "Weak" :
                        pwStrength === 2 ? "Fair" :
                        pwStrength === 3 ? "Good" :
                        "Strong"}
                    </span>
                  </div>
                )}
                {pwErrors.newPassword && <div className="text-red-500 text-xs mt-1">{pwErrors.newPassword.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm New Password</label>
                <div className="relative">
                  <Input type={showConfirmPw ? "text" : "password"} id="confirmPassword" {...pwRegister("confirmPassword")}
                    placeholder="Confirm new password"
                    disabled={pwSaving}
                    autoComplete="new-password"
                  />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPw(v => !v)}>
                    {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {pwErrors.confirmPassword && <div className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword.message}</div>}
              </div>
              <Button type="submit" disabled={pwSaving} className="w-full mt-2">{pwSaving ? "Saving..." : "Change Password"}</Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </LoadingOrEmpty>
    </div>
  );
} 