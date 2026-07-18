export default function InfoCard({ title, children }) {

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            <h2 className="text-xl font-bold text-slate-800 mb-5">
                {title}
            </h2>

            <div className="space-y-4">
                {children}
            </div>

        </div>

    );

}