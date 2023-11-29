export default function Login() {
  return (
    <form
      action="#"
      className="mx-auto mt-8 w-[300px] rounded-lg shadow shadow-black/20 md:w-[500px]"
    >
      <div className="border-b border-black/5">
        <h2 className="rounded-t-xl bg-slate-600/10 p-2 text-center text-xl tracking-wide shadow shadow-black/20">
          SEMAD
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-4 flex flex-col">
          <label htmlFor="email">Email:</label>
          <input
            required
            type="email"
            className="border-roxo w-full rounded border p-2 text-sm outline-none focus:border-indigo-600"
            name="email"
            id="email"
            placeholder="arthur.oliveira@mesquita.rj.gov.br"
          />
        </div>
        <div className="mb-2 flex flex-col">
          <label htmlFor="password">Senha:</label>
          <input
            required
            type="password"
            className="border-roxo w-full rounded border p-2 text-sm outline-none focus:border-indigo-600"
            name="password"
            id="password"
            placeholder="••••••"
          />
        </div>
      </div>
      <div className="flex justify-center rounded-b-xl border-t border-black/10 p-2 shadow shadow-black/20">
        <button className="rounded-3xl border border-slate-600/20 bg-slate-600/20 px-4 py-1 text-center shadow shadow-black/30 outline-none hover:bg-slate-700/30 focus:border-indigo-600">
          Login
        </button>
      </div>
    </form>
  );
}
