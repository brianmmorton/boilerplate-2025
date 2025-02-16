import { Typography, List, ListItem } from "@material-tailwind/react";
import classNames from "classnames";
import { Link, useMatch } from "react-router-dom";
import { ItemGroup } from "./ItemGroup";
import {
  BugAntIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";

export function Sidebar() {
  const isActive = useMatch("///");

  return (
    <div
      className={classNames(
        "p-4 pl-2 pt-0 h-screen z-1 bg-white rounded-tr-lg rounded-br-lg overflow-y-auto sticky left-0 top-0"
      )}
    >
      <List key="1" className="border-b border-gray-300">
        <ListItem selected={!!isActive}>
          <img
            className="w-8 h-8 rounded-lg object-cover object-center mr-3"
            src="https://images.unsplash.com/photo-1682407186023-12c70a4a35e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
            alt="nature"
          />
          <Typography variant="h3" className="text-blue-gray-800">
            <Link to="/">Boilerplate</Link>
          </Typography>
        </ListItem>
      </List>
      {/* <Typography variant="small" color="gray" className="font-semibold mt-4">
          {numFeatures ?? 0} Features
        </Typography> */}
      <List key="2" className="overflow-y-auto mt-4">
        <ItemGroup
          key="1"
          title="Dashboard"
          handleClickGroup={() => {}}
          isActive={false}
          icon={<HomeIcon className="h-4 w-4" />}
        />
        <ItemGroup
          key="2"
          title="Teams"
          handleClickGroup={() => {}}
          isActive={false}
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <ItemGroup
          key="3"
          title="Errors"
          handleClickGroup={() => {}}
          isActive={false}
          icon={<BugAntIcon className="h-4 w-4" />}
        />
        <ItemGroup
          key="4"
          title="Costs"
          handleClickGroup={() => {}}
          isActive={false}
          icon={<CurrencyDollarIcon className="h-4 w-4" />}
        />
      </List>
      <div className="w-full px-8 mt-4">
        <div className="w-full h-px bg-blue-gray-100" />
      </div>
    </div>
  );
}

