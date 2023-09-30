import { diskStorage } from "multer";
import { ConfigModule } from "@nestjs/config";

const generateId = () => {
  return Array(18)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join("");
};

const normalizeFileName = (req, file, cb) => {
  const fileExtName = file.originalname.split(".").pop();

  cb(null, `${generateId()}.${fileExtName}`);
};

console.log(process.env.URL);

export const fileStorage = diskStorage({
  // destination: function (req, file, cb) {
  //   console.log(cb);
  //   console.log(111111, file);
  //   cb(null, "./uploads");
  // },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  //   cb(null, file.fieldname + '-' + uniqueSuffix)
  // }
  destination: `./uploads`,
  filename: normalizeFileName,
});
