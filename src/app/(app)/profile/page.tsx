"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ProfileFormValues = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
};

const initialProfile: ProfileFormValues = {
  name: "Charlotte Nolan",
  title: "Product Designer",
  email: "charlotte@example.com",
  phone: "+1 (555) 879-1234",
  location: "San Francisco, CA",
  bio: "Design lead focused on crafting inclusive, data-informed experiences.",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileFormValues>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: initialProfile,
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    reset(profile);
  }, [profile, reset]);

  const startEditing = () => {
    reset(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset(profile);
    setIsEditing(false);
  };

  const onSubmit = (values: ProfileFormValues) => {
    setProfile(values);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="contents">
        <Card>
          <CardHeader className="gap-6 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarImage src="/avatars/shadcn.jpg" alt={profile.name} />
                <AvatarFallback className="rounded-xl">
                  {profile.name
                    .split(" ")
                    .map((segment) => segment[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {profile.title}
                </CardDescription>
              </div>
            </div>
            <CardAction className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !isDirty}>
                    Save changes
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={startEditing}>
                  Edit profile
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="pb-8">
            <FieldSet>
              <Field>
                <FieldTitle>Contact</FieldTitle>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                      />
                      <FieldError
                        errors={
                          errors.name
                            ? [{ message: errors.name.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.name}
                    </p>
                  )}
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Role</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <Input
                        id="title"
                        {...register("title", { required: "Role is required" })}
                      />
                      <FieldError
                        errors={
                          errors.title
                            ? [{ message: errors.title.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.title}
                    </p>
                  )}
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                      />
                      <FieldError
                        errors={
                          errors.email
                            ? [{ message: errors.email.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.email}
                    </p>
                  )}
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <Input
                        id="phone"
                        {...register("phone", {
                          required: "Phone is required",
                        })}
                      />
                      <FieldError
                        errors={
                          errors.phone
                            ? [{ message: errors.phone.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.phone}
                    </p>
                  )}
                </FieldContent>
              </Field>

              <FieldSeparator />

              <Field>
                <FieldTitle>Personal</FieldTitle>
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <Input
                        id="location"
                        {...register("location", {
                          required: "Location is required",
                        })}
                      />
                      <FieldError
                        errors={
                          errors.location
                            ? [{ message: errors.location.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.location}
                    </p>
                  )}
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <FieldContent>
                  {isEditing ? (
                    <>
                      <textarea
                        id="bio"
                        className="border-input ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...register("bio", {
                          required: "Bio is required",
                          minLength: {
                            value: 10,
                            message: "Share a bit more (min 10 characters)",
                          },
                        })}
                      />
                      <FieldDescription>
                        Summarize what you want teammates to know about you.
                      </FieldDescription>
                      <FieldError
                        errors={
                          errors.bio
                            ? [{ message: errors.bio.message }]
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {profile.bio}
                    </p>
                  )}
                </FieldContent>
              </Field>
            </FieldSet>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
