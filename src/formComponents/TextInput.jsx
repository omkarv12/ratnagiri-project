export default function TextInput({

    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text"

}) {

    return (

        <div>

            <label className="block mb-2 font-semibold text-slate-700">

                {label}

            </label>

            <input

                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}

                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"

            />

        </div>

    );

}