import { Injectable } from "@nestjs/common";

@Injectable()
export class HelloService {
	greet(name: string): string {
		return `Hello, ${name}!`;
	}
}
