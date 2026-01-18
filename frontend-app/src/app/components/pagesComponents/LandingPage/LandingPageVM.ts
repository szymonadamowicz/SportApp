import { Dumbbell, Zap, BarChart3, Users } from "lucide-react"

export const useLandingPageVM = () => {
  const hero = {
    titleTop: "Build strength.",
    titleAccent: "Forge consistency.",
    description:
      "RepForge helps you track workouts, visualize progress and stay disciplined without overengineering your training.",
  }

  const actions = {
    primary: {
      label: "Log in",
      href: "/login",
    },
  }

  const features = [
    {
      icon: Zap,
      title: "Track workouts",
      description: "Log exercises, sets and reps with zero friction",
    },
    {
      icon: BarChart3,
      title: "See real progress",
      description: "Understand your strength gains over time",
    },
    {
      icon: Users,
      title: "Build consistency",
      description: "Train smarter without burning out",
    },
  ]

  return {
    hero,
    actions,
    features,
    logoIcon: Dumbbell,
  }
}
