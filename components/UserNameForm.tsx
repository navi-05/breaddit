"use client";

import * as z from "zod";
import { User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation'
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";

import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

const formSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
});

interface UserNameFormProps {
  user: Pick<User, "id" | "username">;
}

const UserNameForm = ({ user }: UserNameFormProps) => {

  const { loginToast } = useCustomToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.username || "",
    },
  });

  const {
    mutate: updateUserName,
    isLoading
  } = useMutation({
    mutationFn: async ({ name }: z.infer<typeof formSchema>) => {
      const payload = { name }

      const { data } = await axios.patch(`/api/username`, payload)
      return data
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 409) {
          return toast({
            title: "Username already taken!",
            description: "Please choose a different Username",
            variant: 'destructive'
          })
        }
      }
      return toast({
        title: "There was an error",
        description: "Could not create community",
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      toast({
        description: 'Your username has been updated'
      })
      router.refresh()
    }
  })

  return (
    <form onSubmit={handleSubmit((e) => updateUserName(e))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name">Name</Label>
            <Input 
              id='name' 
              className="w-[400px] pl-6" 
              size={32}
              {...register('name')}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {isLoading ? (
            <ButtonLoading />
          ) : (
            <Button type="submit">
              Change name
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
