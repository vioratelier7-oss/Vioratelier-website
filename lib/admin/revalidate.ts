import "server-only";
import { revalidatePath } from "next/cache";

/** Content changed: refresh every public page and the admin views. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
