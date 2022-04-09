import { useEffect, useState } from "react";
import { ProposalDetails } from "../components/ProposalDetails";
import { getProposalDataFromCovalent } from "../helpers/covalent";

function ProposalList() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    async function getData() {
      var proposalData = await getProposalDataFromCovalent();
      setProposals(proposalData);
    }
    getData();
  }, []);

  return (
    <>
      {Object.values(proposals).map(proposal => (
        <ProposalDetails proposal={proposal} key={proposal.proposalId} />
      ))}
    </>
  );
}

export default ProposalList;
