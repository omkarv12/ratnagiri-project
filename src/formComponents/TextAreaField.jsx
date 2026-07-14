export default function TextAreaField({

    label,
    name,
    value,
    onChange,
    rows = 5

}) {

    return (

        <div>

            <label className="block mb-2 font-semibold text-slate-700">

                {label}

            </label>

            <textarea

                rows={rows}
                name={name}
                value={value}
                onChange={onChange}

                className="w-full rounded-lg border border-slate-300 px-4 py-3 resize-y focus:ring-2 focus:ring-orange-500 outline-none"

            />

        </div>

    );

}


