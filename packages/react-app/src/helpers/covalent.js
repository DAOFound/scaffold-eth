import { DAOFOUND_CONTRACT_ADDRESS, COVALENT_API_KEY } from "../constants";
import { defaultAbiCoder } from "ethers/lib/utils";
var base64 = require("base-64");

async function fetchCovalentProposalData(chainId) {
  const url = `https://api.covalenthq.com/v1/${chainId}/events/address/${DAOFOUND_CONTRACT_ADDRESS}/?starting-block=30920009&ending-block=latest`
  var headers = new Headers();
  headers.append("Authorization", "Basic " + base64.encode(COVALENT_API_KEY + ":"));
  return fetch(url, { headers });
}

function processCovalentData(data) {
  let proposals = {};
  let fundingList = [];
  for (var entry of data.data.items) {
    switch (entry.raw_log_topics[0]) {
      case "0x344e2edbd54b7e137047f4e5af7fae74a07ad72083d9641d9cd5244653bded6b":
        const proposalEvent = defaultAbiCoder.decode(["string", "uint256", "uint256"], entry.raw_log_data);
        const proposalId = parseInt(proposalEvent[2]._hex, 16);

        const proposal = {
          recipient: defaultAbiCoder.decode(["address"], entry.raw_log_topics[1]),
          description: proposalEvent[0],
          percentage: parseInt(proposalEvent[1]._hex, 16),
          proposalId: proposalId,
          completed: false,
          fundingAmount: 0,
        };

        proposals[proposalId] = proposal;
        break;
      case "0xa7cbaaf15738ea1bcbdddfb06d8da60b51bd361982de413abad956b5df0b02b9":
        const fundingEvent = defaultAbiCoder.decode(["uint256", "uint256"], entry.raw_log_data);

        const funding = {
          recipient: defaultAbiCoder.decode(["address"], entry.raw_log_topics[1]),
          value: parseInt(fundingEvent[0]._hex, 16),
          proposalId: parseInt(fundingEvent[1]._hex, 16),
        };
        fundingList.push(funding);
        break;
      default:
        continue;
    }
  }

  for (var funding of fundingList) {
    if (proposals[funding.proposalId]) {
      var proposal = proposals[funding.proposalId];
      proposal.fundingAmount = funding.value;
      proposal.completed = true;
    } else {
      console.warn(`Found funding event for proposal ID ${funding.proposalId} but no proposal exists!`);
    }
  }

  return proposals;
}

export async function getProposalDataFromCovalent(chainId) {
  var proposalResponse = await fetchCovalentProposalData(chainId);
  var proposalData = await proposalResponse.json();
  return processCovalentData(proposalData);
}
