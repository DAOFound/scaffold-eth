//SPDX-License-Identifier: GPL 3.0
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DAOFound is ERC721Enumerable {
    mapping (uint => Proposal) public proposals;
    uint public numberOfContributors;
    uint public numberOfProposals;

    struct Proposal {
       address recipient;
       string description;
       uint value;
       bool completed;
       uint yayVotes;

       mapping (address => bool) voters;
    }

    modifier onlyNFTHolders() {
        require(balanceOf(msg.sender) > 0, "Only users holding Contributor NFTs can access this function!");
        _;
    }

    /// Fired when a user creates a flow to send money to our contract   
    event ContributeEvent (address indexed _sender);
    /// Fired when a contributor creates a new proposal for spending the money in the contract
    event CreateProposalEvent (string _description, address indexed _recipient, uint _value);
    /// Fired when our contract sends money to a recipient
    event FundingEvent (address indexed _recipient, uint _value);

    constructor () ERC721("DAOFound", "DAOF") {}

    function mintContributorToken() public {
        require(balanceOf(msg.sender) == 0, "You already have a Contributor NFT!");
        _safeMint(msg.sender, numberOfContributors);
        numberOfContributors++;

        emit ContributeEvent(msg.sender);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) override internal virtual {
        revert("You cannot transfer your Contributor NFT!");
    }

    function createProposal(string memory _description, address _recipient, uint _value) public onlyNFTHolders {
        Proposal storage newRequest = proposals[numberOfProposals];
        numberOfProposals++;

        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;

        emit CreateProposalEvent (_description,_recipient, _value);
    }

    function voteForProposal (uint _proposal) public onlyNFTHolders {
        Proposal storage proposal = proposals[_proposal];
        require (proposal.voters[msg.sender] == false, "You have already voted");
        proposal.voters[msg.sender] = true;
        proposal.yayVotes += 1;
    }

    function executeProposal (uint _proposal) public {
        Proposal storage proposal = proposals[_proposal];
        require(proposal.yayVotes * 2 > totalSupply(), "Only proposals with more than 50% YAY votes can be executed!");
        proposal.completed = true;
        // TODO: send tokens via superfluid

        emit FundingEvent(proposal.recipient, proposal.value);
    }
}