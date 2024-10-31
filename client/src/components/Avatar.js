import React from "react";
import { HiUser } from "react-icons/hi2";
import { useSelector } from "react-redux";

const Avatar = ({ userId, name, imageUrl, width, height }) => {
  const onlineUser = useSelector((state) => state?.user?.onlineUser) || [];

  let avatarName = "";

  if (name) {
    const splitName = name?.split(" ");
    avatarName =
      splitName.length > 1
        ? `${splitName[0][0]}${splitName[1][0]}`
        : splitName[0][0];
  }

  const bgColor = [
    "bg-slate-200",
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-gray-200",
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200",
  ];

  // Generate a random number to pick a background color
  const randomNumber = Math.floor(Math.random() * bgColor.length);

  // Check if the user is online based on userId
  const isOnline = onlineUser.includes(userId);

  return (
    <div
      className={`text-slate-800 rounded-full font-bold relative`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          width={width}
          height={height}
          alt={name}
          className="overflow-hidden rounded-full"
        />
      ) : name ? (
        <div
          style={{ width: `${width}px`, height: `${height}px` }}
          className={`rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`}
        >
          {avatarName}
        </div>
      ) : (
        // Display default user icon if neither imageUrl nor name is provided
        <HiUser size={width} />
      )}

      {isOnline && (
        <div className="bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;
