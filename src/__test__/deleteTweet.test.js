import { deleteTweet } from "../App";
describe("Funcion que elimina un tweet", () => {
    test("Hago click en el boton para eliminar el tweet y se deberia borrar", () => {
        const result = deleteTweet(true);
        expect(result).toBe(true);
    })
})