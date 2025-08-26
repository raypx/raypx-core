import { customAlphabet } from "nanoid"
import { v7 as uuidv7 } from "uuid"

const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz", 16)

export { nanoid, uuidv7 }
