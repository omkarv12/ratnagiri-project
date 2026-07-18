export default function Section({
    title,
    subtitle,
    children
}) {

    return (

        <div className="mb-12">

            <h2 className="text-3xl font-bold text-slate-800">

                {title}

            </h2>

            {subtitle && (

                <p className="text-slate-500 mt-1 mb-8">

                    {subtitle}

                </p>

            )}

            <div className="space-y-6">

                {children}

            </div>

        </div>

    );

}