// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {ISuperfluid, ISuperfluidToken, ISuperToken, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

contract DAOFound is ERC721Enumerable, SuperAppBase {
    //SuperFluid init

    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1;
    ISuperToken private _token;
    ISuperfluid private _host; // host

    constructor(ISuperfluid host, ISuperToken token)
        ERC721("DAOFound", "DAOF")
    {
        //initialize InitData struct, and set equal to cfaV1
        cfaV1 = CFAv1Library.InitData(
            host,
            //here, we are deriving the address of the CFA using the host contract
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP |
            SuperAppDefinitions.AFTER_AGREEMENT_TERMINATED_NOOP |
            SuperAppDefinitions.AFTER_AGREEMENT_UPDATED_NOOP;

        host.registerApp(configWord);

        _host = host;

        _token = token;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public numberOfContributors;
    uint256 public numberOfProposals;

    struct Proposal {
        /// The account receiving the money if the proposal is successful
        address recipient;
        /// A description of the proposal.
        string description;
        /// The percentage of money to send to the recipient if the proposal is successful.
        /// Must be a value between 1 and 100.
        uint256 percentageValue;
        /// A flag indicating whether the proposal has been executed.
        bool completed;
        /// The number of YAY votes for this proposal.
        uint256 yayVotes;
        /// Mapping to check whether an account has voted on this proposal.
        mapping(address => bool) voters;
    }

    modifier onlyNFTHolders() {
        require(
            balanceOf(msg.sender) > 0,
            "Only users holding Contributor NFTs can access this function!"
        );
        _;
    }

    /// Fired when a user creates a flow to send money to our contract
    event ContributeEvent(address indexed _sender);
    /// Fired when a contributor creates a new proposal for spending the money in the contract
    event CreateProposalEvent(
        string _description,
        address indexed _recipient,
        uint256 _percentageValue
    );
    /// Fired when our contract sends money to a recipient
    event FundingEvent(address indexed _recipient, uint256 _value);

    function _mintContributorToken(
        address _addressContributor
    ) private {
        _safeMint(_addressContributor, numberOfContributors);
        numberOfContributors++;

        emit ContributeEvent(_addressContributor);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        revert("You cannot transfer your Contributor NFT!");
    }

    function createProposal(
        string memory _description,
        address _recipient,
        uint256 _percentageValue
    ) public onlyNFTHolders {
        Proposal storage newRequest = proposals[numberOfProposals];
        numberOfProposals++;

        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.percentageValue = _percentageValue;
        newRequest.completed = false;

        emit CreateProposalEvent(_description, _recipient, _percentageValue);
    }

    function voteForProposal(uint256 _proposal) public onlyNFTHolders {
        Proposal storage proposal = proposals[_proposal];
        require(proposal.completed == false, "You cannot vote for completed proposals!");
        require(proposal.voters[msg.sender] == false, "You have already voted");
        proposal.voters[msg.sender] = true;
        proposal.yayVotes += 1;
    }

    function executeProposal(uint256 _proposal) public {
        Proposal storage proposal = proposals[_proposal];
        require(proposal.completed == false, "Cannot execute a proposal several times!");
        require(
            proposal.yayVotes * 2 > totalSupply(),
            "Only proposals with more than 50% YAY votes can be executed!"
        );
        proposal.completed = true;

        uint256 totalBalance = _token.balanceOf(address(this));
        uint256 value = totalBalance * proposal.percentageValue / 100;
        _token.downgrade(value);
        IERC20 underlyingToken = IERC20(_token.getUnderlyingToken());
        underlyingToken.transfer(proposal.recipient, value);

        emit FundingEvent(proposal.recipient, value);
    }

    // Super fluid functions

    //This function gets called whenever a new IN flow is made TO this contract
    function afterAgreementCreated(
        ISuperToken _superToken,
        address, // _agreementClass,
        bytes32, // _agreementId,
        bytes calldata _agreementData,
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        // decode Contex - this will return the entire Context struct
        // ISuperfluid.Context memory decompiledContext = _host.decodeCtx(_ctx);

        // address decodedUserData = abi.decode(
        //     decompiledContext.userData,
        //     (address)
        // );

        (address sender, address receiver) = abi.decode(_agreementData, (address, address));

        // Mint contributor NFT only for new contributors
        if (balanceOf(sender) == 0) {
            _mintContributorToken(sender);
        }

        return _ctx;
    }

    modifier onlyHost() {
        require(
            msg.sender == address(_host),
            "RedirectAll: support only one host"
        );
        _;
    }
}
