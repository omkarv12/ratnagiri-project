export default function RadioGroup({

    label,
    name,
    value,
    options,
    onChange

}) {

    return (

        <div>

            <label className="block mb-3 font-semibold text-slate-700">

                {label}

            </label>

            <div className="flex flex-wrap gap-6">

                {options.map((option) => (

                    <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                    >

                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={value === option}
                            onChange={onChange}
                        />

                        <span>{option}</span>

                    </label>

                ))}

            </div>

        </div>

    );

}