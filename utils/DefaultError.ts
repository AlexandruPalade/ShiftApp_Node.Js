export class DefaultError {
    static generate(code: number, message: string) {
        return {
            code,
            message
        }
    }
}

