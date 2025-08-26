import { auth } from "./auth"
import { errors } from "./errors"
import { organization } from "./organization"

export default {
  ...auth,
  ...organization,
  ...errors,
}
