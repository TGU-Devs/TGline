declare module "boring-avatars" {
  import { FC } from "react";

  export type AvatarVariant = 
    | "marble"
    | "beam"
    | "pixel"
    | "sunset"
    | "ring"
    | "bauhaus";

  export interface AvatarProps {
    name: string;
    size?: number;
    variant?: AvatarVariant;
    colors?: string[];
    square?: boolean;
  }

  const Avatar: FC<AvatarProps>;
  export default Avatar;
}
