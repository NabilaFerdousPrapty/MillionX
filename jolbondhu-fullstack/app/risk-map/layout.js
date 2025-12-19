import LeafletFix from '@/components/LeafletFix';

export default function RiskMapLayout({ children }) {
    return (
        <>
            <LeafletFix />
            {children}
        </>
    );
}