export default function SelectField({

    label,
    name,
    value,
    options,
    onChange

}) {

    return (

        <div>

            <label className="block mb-2 font-semibold text-slate-700">

                {label}

            </label>

            <select

                name={name}
                value={value}
                onChange={onChange}

                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"

            >

                <option value="">
                    Select
                </option>

                {options.map((option) => (

                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>

                ))}

            </select>

        </div>

    );

}