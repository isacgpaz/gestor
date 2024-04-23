import { BottomBarItem } from "@/components/common/bottom-bar";
import { Home, LayoutDashboard, Settings } from "lucide-react";

export const customerBottomBar = [
  <BottomBarItem
    path="/dashboard"
    icon={LayoutDashboard}
    key='dashboard'
  />,
  <BottomBarItem
    path="/settings"
    icon={Settings}
    key='settings'
  />,
]

export const adminBottomBar = [
  <BottomBarItem
    path="/admin/dashboard"
    icon={Home}
    key='dashboard'
  />,
  <BottomBarItem
    path="/admin/settings"
    icon={Settings}
    key='settings'
  />,
]