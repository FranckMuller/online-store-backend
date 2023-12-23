import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface IUserPayload {
  userId: string,
  username: string 
}

export const UseUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
