export default function CheckboxGroup({

    label,
    name,
    values = [],
    options,
    onChange

}) {

    return (

        <div>

            <label className="block mb-3 font-semibold text-slate-700">

                {label}

            </label>

            <div className="grid md:grid-cols-2 gap-3">

                {options.map((option) => (

                    <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                    >

                        <input
                            type="checkbox"
                            name={name}
                            value={option}
                            checked={values.includes(option)}
                            onChange={onChange}
                        />

                        <span>{option}</span>

                    </label>

                ))}

            </div>

        </div>

    );

}