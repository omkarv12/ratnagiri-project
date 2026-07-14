export default function ChipList({ title, values }) {

    if (!values) return null;

    let items = [];

    if (Array.isArray(values)) {

        items = values;

    } else if (typeof values === "string") {

        items = values
            .replace(/[{}"]/g, "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

    }

    if (items.length === 0) return null;

    return (

        <div>

            <h3 className="font-semibold text-slate-600 mb-3">
                {title}
            </h3>

            <div className="flex flex-wrap gap-2">

                {items.map((item) => (

                    <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm"
                    >
                        {item}
                    </span>

                ))}

            </div>

        </div>

    );

}