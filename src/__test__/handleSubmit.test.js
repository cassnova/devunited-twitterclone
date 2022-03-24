import { handleSubmit } from "../App";
describe("Probando test para el handleSubmit", () => {
    test("Ingreso el tweet y el resultado deberia ser true", () => {
        const result = handleSubmit(true);
        expect(result).toBe(true)
    })
})