import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserDataServerType } from "@/lib/types";
import { updateProfileSchema, updateProfileValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { HiPhoto } from "react-icons/hi2";
import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "./actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  userData: UserDataServerType;
  setOpenDialog?: (open: boolean) => void;
}

export default function EditProfileButton({ userData }: Props) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button
          className="text-mds h-fit rounded-full border border-white/50 bg-black px-4 py-2 font-bold text-white"
          onClick={() => setOpenDialog(true)}
        >
          Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <EditProfileForm userData={userData} setOpenDialog={setOpenDialog} />
      </DialogContent>
    </Dialog>
  );
}

function EditProfileForm({ userData, setOpenDialog }: Props) {
  const [blobImg, setBlobImg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<updateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onChange",
    defaultValues: {
      image: userData.image || "",
      firstname: userData.firstname || "",
      surname: userData.surname || "",
      bio: userData.bio || "",
    },
  });

  const { startUpload, isUploading } = useUploadThing("profileImage", {
    onBeforeUploadBegin(files) {
      const uploadedFile = files.map((file) => {
        const extension = file.name.split(".")[1];

        const fileReplacer = new File(
          [file],
          `profileImage_${crypto.randomUUID()}.${extension}`,
          { type: file.type },
        );

        return fileReplacer;
      });

      return uploadedFile;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      form.setValue("image", res[0].url);
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: updateProfileValues) => {
      const data = updateProfile(values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setOpenDialog(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleChangeImage = (image: File) => {
    setBlobImg(URL.createObjectURL(image));
    startUpload([image]);
  };

  const onSubmit = (values: updateProfileValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative h-[100px] w-[100px]">
                  <Image
                    src={blobImg || userData.image || avatarPlaceholder}
                    alt=""
                    fill
                    className="rounded-full object-cover"
                  />
                  <input
                    type="file"
                    ref={inputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        const file = e.target.files[0];
                        handleChangeImage(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black p-3"
                    onClick={() => inputRef.current?.click()}
                  >
                    <HiPhoto />
                  </button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid w-full grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <div>
                <span>{field.value?.length}/160</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-white px-5 py-2 font-bold text-black disabled:bg-white/50"
          disabled={(uploadProgress > 0 && uploadProgress < 100) || isPending}
        >
          Save
        </button>
      </form>
    </Form>
  );
}
