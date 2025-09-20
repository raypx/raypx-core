"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@raypx/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form";
import { Loader2, Trash, UploadCloud } from "@raypx/ui/components/icons";
import { Input } from "@raypx/ui/components/input";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { type ComponentProps, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import { fileToBase64, resizeAndCropImage } from "../../core/lib/image-utils";
import { cn, getLocalizedError } from "../../core/lib/utils";
import { OrganizationLogo } from "./organization-logo";

export interface CreateOrganizationDialogProps extends ComponentProps<typeof Dialog> {
  className?: string;
  classNames?: SettingsCardClassNames;
}

export function CreateOrganizationDialog({
  className,
  classNames,
  onOpenChange,
  ...props
}: CreateOrganizationDialogProps) {
  const { authClient, t, organization: organizationOptions, navigate, toast } = useAuth();

  const [logo, setLogo] = useState<string | null>(null);
  const [logoPending, setLogoPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFileDialog = () => fileInputRef.current?.click();

  const formSchema = z.object({
    logo: z.string().optional(),
    name: z.string().min(1, {
      message: t("FIELD_IS_REQUIRED", { field: t("ORGANIZATION_NAME") }),
    }),
    slug: z
      .string()
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("ORGANIZATION_SLUG") }),
      })
      .regex(/^[a-z0-9-]+$/, {
        message: `${t("ORGANIZATION_SLUG")} ${t("IS_INVALID")}`,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: "",
      name: "",
      slug: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleLogoChange = async (file: File) => {
    if (!organizationOptions?.logo) return;

    setLogoPending(true);

    try {
      const resizedFile = await resizeAndCropImage(
        file,
        crypto.randomUUID(),
        organizationOptions.logo.size,
        organizationOptions.logo.extension,
      );

      let image: string | undefined | null;

      if (organizationOptions?.logo.upload) {
        image = await organizationOptions.logo.upload(resizedFile);
      } else {
        image = await fileToBase64(resizedFile);
      }

      setLogo(image || null);
      form.setValue("logo", image || "");
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }

    setLogoPending(false);
  };

  const deleteLogo = async () => {
    setLogoPending(true);

    const currentUrl = logo || undefined;
    if (currentUrl && organizationOptions?.logo?.delete) {
      await organizationOptions.logo.delete(currentUrl);
    }

    setLogo(null);
    form.setValue("logo", "");
    setLogoPending(false);
  };

  async function onSubmit({ name, slug, logo }: z.infer<typeof formSchema>) {
    try {
      const organization = await authClient.organization.create({
        name,
        slug,
        logo,
        fetchOptions: { throw: true },
      });

      if (organizationOptions?.pathMode === "slug") {
        navigate(`${organizationOptions.basePath}/${organization.slug}`);
        return;
      }

      await authClient.organization.setActive({
        organizationId: organization.id,
      });

      onOpenChange?.(false);
      form.reset();
      setLogo(null);

      toast({
        variant: "success",
        message: t("CREATE_ORGANIZATION_SUCCESS"),
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("CREATE_ORGANIZATION")}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {t("ORGANIZATIONS_INSTRUCTIONS")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {organizationOptions?.logo && (
              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <input
                      ref={fileInputRef}
                      accept="image/*"
                      disabled={logoPending}
                      hidden
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.item(0);
                        if (file) handleLogoChange(file);
                        e.target.value = "";
                      }}
                    />

                    <FormLabel>{t("LOGO")}</FormLabel>

                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-fit rounded-full"
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <OrganizationLogo
                              className="size-16"
                              isPending={logoPending}
                              organization={{
                                name: form.watch("name"),
                                logo,
                              }}
                            />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuItem onClick={openFileDialog} disabled={logoPending}>
                            <UploadCloud />

                            {t("UPLOAD_LOGO")}
                          </DropdownMenuItem>

                          {logo && (
                            <DropdownMenuItem
                              onClick={deleteLogo}
                              disabled={logoPending}
                              variant="destructive"
                            >
                              <Trash />

                              {t("DELETE_LOGO")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        disabled={logoPending}
                        variant="outline"
                        onClick={openFileDialog}
                        type="button"
                      >
                        {logoPending && <Loader2 className="animate-spin" />}

                        {t("UPLOAD")}
                      </Button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ORGANIZATION_NAME")}</FormLabel>

                  <FormControl>
                    <Input placeholder={t("ORGANIZATION_NAME_PLACEHOLDER")} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ORGANIZATION_SLUG")}</FormLabel>

                  <FormControl>
                    <Input placeholder={t("ORGANIZATION_SLUG_PLACEHOLDER")} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className={cn(classNames?.button, classNames?.outlineButton)}
              >
                {t("CANCEL")}
              </Button>

              <Button
                type="submit"
                className={cn(classNames?.button, classNames?.primaryButton)}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {t("CREATE_ORGANIZATION")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
