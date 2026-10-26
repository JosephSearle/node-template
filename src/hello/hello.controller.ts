import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { z } from "zod";
import { HelloService } from "./hello.service";

const helloQuery = z.object({
	name: z.string().trim().min(1).max(100).default("world"),
});

/** Example resource. Replace it with your own modules; keep the validate-then-delegate shape. */
@Controller("v1/hello")
export class HelloController {
	constructor(private readonly hello: HelloService) {}

	@Get()
	get(@Query() query: unknown): { message: string } {
		const parsed = helloQuery.safeParse(query);
		if (!parsed.success) {
			throw new BadRequestException(
				parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
			);
		}
		return { message: this.hello.greet(parsed.data.name) };
	}
}
