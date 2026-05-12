import { z } from "zod";

/**
 * 2-component vector (x, y). FiveM `vec2(x, y)`.
 */
export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Vector2 = z.infer<typeof Vector2Schema>;

/**
 * 3-component vector (x, y, z). FiveM `vec3(x, y, z)`.
 * Used for positions, rotations, camera offsets.
 */
export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});
export type Vector3 = z.infer<typeof Vector3Schema>;

/**
 * 4-component vector (x, y, z, w). FiveM `vec4(x, y, z, w)`.
 * `w` is typically heading (degrees) in worldspace positions.
 */
export const Vector4Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number(),
});
export type Vector4 = z.infer<typeof Vector4Schema>;
