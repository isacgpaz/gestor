import { BottomBarItem } from "@/components/common/bottom-bar";
import { LayoutDashboard, Settings } from "lucide-react";

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
    disabled
  />,
]