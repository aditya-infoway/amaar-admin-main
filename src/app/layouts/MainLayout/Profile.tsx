// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TbCoins, TbUser, TbUsersGroup } from "react-icons/tb";
import { Link } from "react-router";

// Local Imports
import { Avatar, Button } from "@/components/ui";
import { APP_FAVICON, APP_NAME, ColorType } from "@/constants/app";

import { useAuthContext } from "@/app/contexts/auth/context";
import { GHOST_ENTRY_PATH } from "@/constants/app";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";

// Define Link Types
interface LinkItem {
  id: string;
  title: string;
  description: string;
  to: string;
  Icon: React.ElementType;
  color: ColorType;
}

const links: LinkItem[] = [
  {
    id: "1",
    title: "Profile",
    description: "Your profile Setting",
    to: "/settings/general",
    Icon: TbUser,
    color: "warning",
  },
  // {
  //   id: "2",
  //   title: "Messages",
  //   description: "Your messages and tasks",
  //   to: "/apps/chat",
  //   Icon: ChatBubbleLeftIcon,
  //   color: "info",
  // },
  // {
  //   id: "3",
  //   title: "Team",
  //   description: "Your team members",
  //   to: "#",
  //   Icon: TbUsersGroup,
  //   color: "secondary",
  // },
  // {
  //   id: "4",
  //   title: "Billing",
  //   description: "Your billing information",
  //   to: "/settings/billing",
  //   Icon: TbCoins,
  //   color: "error",
  // },
  {
    id: "5",
    title: "Settings",
    description: "Webapp settings",
    to: "/settings/appearance",
    Icon: Cog6ToothIcon,
    color: "success",
  },
];

// ----------------------------------------------------------------------

export function Profile() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("Company Name");

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const companyDetailsId = localStorage.getItem("companyDetailsId");

        if (!companyDetailsId) {
          return;
        }

        const response = await Get(
          "superadmin/company-details",
          { companyDetailsId },
          false,
        );

        if (response.data?.success) {
          setCompanyName(response.data.data?.companyName || "Company Name");
        }
      } catch (error) {
        console.error("Failed to fetch company name:", error);
      }
    };

    fetchCompanyName();
  }, []);

  const handleLogout = async (close: () => void) => {
    try {
      await logout();
      close();
      navigate(GHOST_ENTRY_PATH);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Popover className="relative">
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
        src={APP_FAVICON}
        alt={APP_NAME}
        classNames={{ image: "object-contain p-0.5" }}
        className="cursor-pointer"
      />

      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          {({ close }) => (
            <>
              {/* User Info */}
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                <Avatar
                  size={14}
                  src={APP_FAVICON}
                  alt={APP_NAME}
                  classNames={{ image: "object-contain p-1" }}
                />

                <div>
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                    to="/settings/general"
                  >
                    {companyName || "Company Name"}
                  </Link>

                  <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
                    Company Profile
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col pt-2 pb-5">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    onClick={() => close()}
                    className="group dark:hover:bg-dark-600 dark:focus:bg-dark-600 flex items-center gap-3 px-4 py-2 tracking-wide outline-hidden transition-all hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <Avatar
                      size={8}
                      initialColor={link.color}
                      classNames={{ display: "rounded-lg" }}
                    >
                      <link.Icon className="size-4.5" />
                    </Avatar>

                    <div>
                      <h2 className="group-hover:text-primary-600 group-focus:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400 dark:group-focus:text-primary-400 font-medium text-gray-800 transition-colors">
                        {link.title}
                      </h2>

                      <div className="dark:text-dark-300 truncate text-xs text-gray-400">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Logout Button */}
                <div className="px-4 pt-4">
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={() => handleLogout(close)}
                  >
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
