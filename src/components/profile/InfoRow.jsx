export default function InfoRow({ label, value }) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    return (

        <div className="flex justify-between gap-6 border-b border-slate-100 pb-2">

            <span className="font-semibold text-slate-600">
                {label}
            </span>

            <span className="text-right text-slate-800">
                {value}
            </span>

        </div>

    );

}