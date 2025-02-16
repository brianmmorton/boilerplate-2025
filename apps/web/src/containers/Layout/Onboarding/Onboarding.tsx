import React, { useContext, useState } from "react";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Alert,
} from "@material-tailwind/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { cache } from "cache/cache";

type Inputs = {
  name: string;
};

export function Onboarding({ onClose }: { onClose: () => void }) {
  const [info, setInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setSaving(true);
      const response = await fetch("/1/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Unknown");
      }

      const info = await response.json();
      setInfo(info);
      setSaving(false);
    } catch (err) {
      setSaving(false);
      console.error(err);
      alert("An unknown error occurred, please try again.");
    }
  };

  const appForm = (
    <Card className="mx-auto w-full max-w-[24rem]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <>
          <CardBody className="flex flex-col gap-4">
            <Typography variant="h4" color="blue-gray">
              Lets create your first blah
            </Typography>
            <Alert
              variant="ghost"
              className="mr-0"
              icon={<InformationCircleIcon className="h-5 w-5 inline-block" />}
            >
              <span>
                Some description
              </span>
            </Alert>
            <Typography className="-mb-2" variant="h6">
              Name
            </Typography>
            <Input
              label="Name"
              size="lg"
              {...register("name", { required: true })}
            />
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" fullWidth type="submit" loading={saving}>
              Create
            </Button>
          </CardFooter>
        </>
      </form>
    </Card>
  );

  return (
    <Dialog
      size="xs"
      open
      handler={() => {}}
      className="bg-transparent shadow-none"
    >
      {appForm}
    </Dialog>
  );
}
