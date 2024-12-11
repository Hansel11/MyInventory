import { useState } from "react";

export default function useAuth() {
  const getToken = () => {
    const tokenString = sessionStorage.getItem("token");
    const userToken = JSON.parse(tokenString as string);
    return userToken?.token;
  };

  const getUsername = () => {
    return sessionStorage.getItem("username");
  };

  const getUserID= () => {
    return sessionStorage.getItem("userid");
  };

  const getRole = () => {
    return sessionStorage.getItem("role");
  };

  const getGudangAccess = () => {
    return sessionStorage.getItem("gudangAccess");
  };

  const [token, setToken] = useState(getToken());
  const [username, setUsername] = useState(getUsername());
  const [userID, setUserID] = useState(getUserID());
  const [role, setRole] = useState(getRole());
  const [gudangAccess, setGudangAccess] = useState(getGudangAccess());
  
  const saveToken = (userToken: any) => {
    sessionStorage.setItem("token", JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const saveUsername = (name: string) => {
    sessionStorage.setItem("username", name);
    setUsername(name);
  };

  const saveUserID = (id: string) => {
    sessionStorage.setItem("userid", id);
    setUserID(id);
  };

  const saveRole = (role: string) => {
    sessionStorage.setItem("role", role);
    setRole(role);
  };

  const saveGudangAccess = (gudangAccess: string) => {
    sessionStorage.setItem("gudangAccess", gudangAccess);
    setGudangAccess(gudangAccess);
  };

  return {
    setToken: saveToken,
    setUsername: saveUsername,
    setUserID : saveUserID,
    setRole: saveRole,
    setGudangAccess: saveGudangAccess,
    token,
    username,
    role,
    gudangAccess,
    userID
  };
}
