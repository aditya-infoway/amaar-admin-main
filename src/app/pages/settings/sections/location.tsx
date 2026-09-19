import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MapPinIcon, PencilIcon } from "@heroicons/react/24/outline";

import { Button, Input } from "@/components/ui";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

interface LocationFormValues {
  latitude: string;
  longitude: string;
}

export default function Location() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [locating, setLocating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [companyDetails, setCompanyDetails] = useState<
    Record<string, any> | null
  >(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: {
      latitude: "",
      longitude: "",
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Ye sirf "map link dikhana hai ya nahi" ke liye hai (live form values)
  const hasValues = !!latitude && !!longitude;

  // Ye asli source of truth hai: backend pe location SAVE hui hai ya nahi.
  // Form ke watched values (typing/geolocation se aaye) ise NAHI badalte —
  // sirf successful save (ya initial fetch) ke baad companyDetails update hota hai.
  const hasSavedLocation =
    companyDetails?.latitude != null && companyDetails?.longitude != null;

  // Fields (aur Use Current Location button) enabled rahenge jab:
  // - user explicitly Edit pe click kare (isEditing = true), YA
  // - abhi tak backend pe koi location saved hi nahi hai (hasSavedLocation = false)
  const isFormEditable = isEditing || !hasSavedLocation;

  // -----------------------------------------
  // Fetch existing company location
  // -----------------------------------------
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setFetching(true);

      try {
        const companyDetailsId =
          localStorage.getItem("companyDetailsId");

        if (!companyDetailsId) {
          toasterrormsg("No company selected.");
          setFetching(false);
          return;
        }

        const response = await Get(
          "superadmin/company-details",
          { companyDetailsId },
          false,
        );

        if (response.data?.success) {
          const d = response.data.data;

          setCompanyDetails(d);

          reset({
            latitude:
              d.latitude != null ? String(d.latitude) : "",
            longitude:
              d.longitude != null ? String(d.longitude) : "",
          });
        } else {
          toasterrormsg(
            response.data?.message ||
              "Failed to fetch company details.",
          );
        }
      } catch (error) {
        toasterrormsg(
          "Something went wrong while fetching company details.",
        );
      } finally {
        setFetching(false);
      }
    };

    fetchCompanyDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------
  // Edit Location
  // -----------------------------------------
  const handleEdit = () => {
    setIsEditing(true);
  };

  // -----------------------------------------
  // Cancel Edit
  // -----------------------------------------
  const handleCancel = () => {
    if (companyDetails) {
      reset({
        latitude:
          companyDetails.latitude != null
            ? String(companyDetails.latitude)
            : "",
        longitude:
          companyDetails.longitude != null
            ? String(companyDetails.longitude)
            : "",
      });
    } else {
      // Kabhi save hi nahi hua tha, to blank kar do
      reset({ latitude: "", longitude: "" });
    }

    setIsEditing(false);
  };

  // -----------------------------------------
  // Use Current Location
  // -----------------------------------------
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toasterrormsg(
        "Geolocation is not supported by this browser.",
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue(
          "latitude",
          String(position.coords.latitude),
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );

        setValue(
          "longitude",
          String(position.coords.longitude),
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );

        setLocating(false);

        toastsuccessmsg(
          "Current location captured. Click Save to apply.",
        );
      },
      (error) => {
        setLocating(false);

        toasterrormsg(
          error.message ||
            "Unable to fetch current location. Please allow location access.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  // -----------------------------------------
  // Submit
  // -----------------------------------------
  const onSubmit = async (data: LocationFormValues) => {
    if (!data.latitude || !data.longitude) {
      toasterrormsg(
        "Please set latitude and longitude before saving.",
      );
      return;
    }

    setLoading(true);

    try {
      const companyDetailsId =
        localStorage.getItem("companyDetailsId");

      const formPayload = new FormData();

      const fieldsToResend = [
        "companyName",
        "natureOfBusiness",
        "taxSystem",
        "addressLine1",
        "addressLine2",
        "city",
        "pinCode",
        "country",
        "state",
        "stateCode",
        "district",
        "mobile",
        "phone",
        "email",
        "website",
        "dateFormat",
        "gstNo",
        "vatNo",
        "panNo",
        "tanNo",
        "dlNo1",
        "dlNo2",
        "dealsIn",
        "bankHolderName",
        "bankAccountNo",
        "branchName",
        "ifscCode",
      ];

      formPayload.append(
        "companyDetailsId",
        companyDetailsId || "",
      );

      fieldsToResend.forEach((key) => {
        formPayload.append(
          key,
          companyDetails?.[key] ?? "",
        );
      });

      formPayload.append("latitude", data.latitude);
      formPayload.append("longitude", data.longitude);

      const response = await Post(
        "superadmin/company-details/update",
        formPayload,
        true,
      );

      if (response.data?.success) {
        // companyDetails ko update karo — yehi "saved" state ka source hai,
        // isi se hasSavedLocation true banega
        setCompanyDetails((prev) => ({
          ...(prev || {}),
          latitude: data.latitude,
          longitude: data.longitude,
        }));

        toastsuccessmsg(
          response.data?.message ||
            "Company location updated successfully.",
        );

        // Save ke baad edit mode band, ab hasSavedLocation true ho jayega
        // to fields naturally disabled ho jayengi
        setIsEditing(false);
      } else {
        toasterrormsg(
          response.data?.message ||
            "Failed to update company location.",
        );
      }
    } catch (error) {
      toasterrormsg(
        "Something went wrong while updating company location.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (fetching) {
    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <p className="dark:text-dark-200 text-sm text-gray-500">
          Loading company location...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
            Location
          </h5>

          <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
            Set your company location. Employees will only be
            able to login within a 100 meter radius of this
            location.
          </p>
        </div>
      </div>

      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Company Coordinates
          </p>

          {/* Current Location Button */}
          <div className="mt-4">
            <Button
              type="button"
              color="primary"
              variant="outlined"
              onClick={handleUseCurrentLocation}
              disabled={!isFormEditable || locating}
              className="rounded-xl"
            >
              <MapPinIcon className="mr-1.5 size-4.5" />

              {locating
                ? "Fetching location..."
                : "Use My Current Location"}
            </Button>
          </div>

          {/* Coordinates */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register("latitude", {
                required: "Latitude is required",
              })}
              label="Latitude"
              placeholder="e.g. 21.7645"
              className="rounded-xl"
              error={errors.latitude?.message}
              disabled={!isFormEditable}
            />

            <Input
              {...register("longitude", {
                required: "Longitude is required",
              })}
              label="Longitude"
              placeholder="e.g. 70.5231"
              className="rounded-xl"
              error={errors.longitude?.message}
              disabled={!isFormEditable}
            />
          </div>

          {/* Google Maps — live form values ke basis par, save hone ka wait nahi karta */}
          {hasValues && (
            <div className="mt-4">
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm font-medium hover:underline"
              >
                View this location on Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Edit button — sirf tab dikhega jab location backend pe already SAVED hai aur abhi edit mode me nahi hain */}
        <div className="flex justify-end">
          {!isEditing && hasSavedLocation && (
            <Button
              type="button"
              color="primary"
              variant="outlined"
              onClick={handleEdit}
              className="rounded-xl"
            >
              <PencilIcon className="mr-1.5 size-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Save / Cancel — jab edit mode ho YA abhi tak location backend pe save hi na ho */}
        {isFormEditable && (
          <div className="mt-8 flex justify-end space-x-3">
            {/* Cancel sirf tab dikhaye jab pehle se backend pe koi saved location ho, warna cancel karne ko kuch nahi */}
            {hasSavedLocation && (
              <Button
                type="button"
                className="min-w-28"
                disabled={loading || locating}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              className="min-w-28"
              color="primary"
              disabled={loading || locating}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}