"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateUser, deleteUser, logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth.authenticator);

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (auth) {
      reset({
        name: auth.name || "",
        email: auth.email || "",
        companyName: auth.companyName || "",
        phone: auth.phone || "",
      });
    }
  }, [auth, reset]);

  // ---------------------- UPDATE PROFILE ----------------------
  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await dispatch(updateUser(formData)).unwrap();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- DELETE ACCOUNT ----------------------
  const handleDelete = async () => {
    if (!confirm("Delete your account permanently?")) return;

    setLoading(true);
    try {
      await dispatch(deleteUser()).unwrap();
      toast.success("Account deleted!");
      router.push("/signup");
    } catch (err: any) {
      toast.error(err || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- LOGOUT ----------------------
  const handleLogout = async () => {
    setLoading(true);
    try {
      await dispatch(logoutUser()).unwrap();
      router.push("/login");
    } catch (err: any) {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-black p-6">
      {/* HEADER */}
     <header className="flex justify-between items-center mb-8">
  {/* Logo / Title */}
 <Link href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}>
      <h1 className="text-3xl font-bold text-blue-800">Investocrafy</h1>
    </Link>
  {/* Buttons */}
  <div className="flex gap-4">
    {/* Home button */}
    <Link href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}>
      <Button variant="outline">Home</Button>
    </Link>

    {/* Chat button */}
    <Link href={`${process.env.NEXT_PUBLIC_PROD_URL}/Chat` || "http://localhost:3000/Chat"}>
      <Button variant="outline">Chat</Button>
    </Link>
  </div>
</header>


      {/* PROFILE CARD */}
      <Card className="shadow-lg border rounded-xl">
        <CardHeader className="pb-2 bg-blue-50">
          <h2 className="text-xl font-semibold text-blue-900">Profile</h2>
          <p className="text-sm text-blue-700">
            Update your personal details and account information
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500">
              <img
                src={auth?.avatar?.url || "/default-avatar.png"}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="text-sm text-gray-600 italic">
              Avatar editable soon
            </label>
          </div>

          {/* FORM */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="John Doe"
                {...register("name", { 
                  required: "Name is required", 
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Name can only contain letters and spaces"
                  }
                })}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                placeholder="example@mail.com"
                type="email"
                {...register("email", { 
                  required: "Email is required", 
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format"
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name</label>
              <Input placeholder="Company XYZ" {...register("companyName")} />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                placeholder="+92 300 0000000"
                {...register("phone", {
                  pattern: {
                    value: /^\+?[0-9]{7,15}$/,
                    message: "Invalid phone number"
                  }
                })}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>}
            </div>

            {/* Footer buttons */}
            <CardFooter className="pt-6 flex flex-col md:flex-row justify-between gap-4 px-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="destructive"
                type="button"
                className="w-full"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleLogout}
                disabled={loading}
              >
                Logout
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* HELP CARD */}
      <Card className="shadow-lg border rounded-xl mt-6 bg-white">
        <CardHeader>
          <h2 className="text-xl font-semibold text-black">Help & Support</h2>
          <p className="text-sm text-gray-700">
            Common guides and helpful information
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 pb-4 flex flex-col gap-2">
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Reset your password</li>
            <li>Update personal information</li>
            <li>Get support and assistance</li>
          </ul>
        </CardContent>

        <CardFooter>
          <Button variant="outline" className="w-full">
 <Link
  href="https://wa.me/03116404897?text=Hello! I have a  issue problem ."
  target="_blank"
  rel="noopener noreferrer"
>
  Support and Contact
</Link>

          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
