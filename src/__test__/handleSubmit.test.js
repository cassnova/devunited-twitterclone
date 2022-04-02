import handleSubmit from '../components/handleSubmit'
describe("Probando test para el handleSubmit", () => {
    test("Ingreso el tweet y el resultado deberia ser true", () => {
        render(handleSubmit);
        const component = screen.getByText('Tweet', { exact: true });
        expect(component).toBeInTheDocument();
    });
});