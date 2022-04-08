//SPDX-License-Identifier: GPL 3.0
pragma solidity >=0.6.0 <0.9.0;

contract CharityDAO {
       CrowdFunding[]public fundings;
       
       function createFunding (uint inputGoal, uint inputDedline) public {
                CrowdFunding newFunding = new CrowdFunding (inputGoal, inputDedline, msg.sender);
                fundings.push (newFunding);
       }

contract CrowdFunding {

    mapping ( address => uint) public contributors;
    address public admin;
    uint public numberOfContributors;
    uint public minimmumContribution;
    uint public tokenId;
    uint public deadline;
    uint public raisedAmount;
    uint public moneyFlow;
    uint public proposals;
    uint public proposalNFT;
    uint public goal;


    struct Request {

        string descritpion;
        address payable recipient;
        uint value;
        bool completed;
        uint numberOfVoters;
        uint numberOfProposals;

        mapping (address => bool) voters;

    }

    event ContributeEvent (address _sender, uint _value);
    event CreateRequestEvent (string _description, address _recipient, uint _value);
    event MakePaymentEvent (address _recipient, uint _value);
    event ProposalsNFT (address _owner, msg.sender, uint _value);
    event MemebershipNFT (address _tokenID, uint _value);

    mapping (uint => Request) public requests;

    uint public numrequests;

    constructor (uint _goal, uint _deadline, address _charity) {

        goal = _goal * 1 ether;
        deadline = block.timestamp * _deadline;
        admin = charity;

        minimmumContribution = 0.05 ether;

    }
   function contribute () public payable {

    require (block.timestamp < deadline , "deadline has passed");
    require (msg.value >= minimmumContribution, "minimmun contribution not met");
    require ()
    

    if (contributors[msg.sender]= 0){
       numberOfContributors ++;
    }
    contributors [msg.sender] += msg.value;
    raisedAmount += msg.value;
    emit ContributeEvent (msg.sender, msg.value);
   
   }

   recive payable external {
        contribute()
   }

   function getBalance () public view returns (uint){
          return address (this) .balance;

   }
//Refund Money

function refund () public {
       require(block.timestamp > deadline && raisedAmmount < goal);
       require(contributors[msg.sender]> 0);

        address payable recipient = payable [msg.sender];
        uint value = contibutors [msg.sender];
        recipient .transfer(value);

        contributors [msg.sender] = 0 ;
}

modifier onlyAdmin(){
require (msg.sender == admin, "only admin can call this function")
}

function CreateRequest(string memory _description, address payable _recipient, uint _value){
   Request storage newRequest = requests[numRequests];
   numRequests ++;

   numRequest.description = _description;
   numRequest.recipient = _recipient;
   numRequest.value = _value;
   numRequest.completed = false;
   numRequest.numberOfVoters = 0;

   emit CreateRequestEvent (_description,_recipient, _value);
}

function voteRequest (uint _requestNo) public {
       require (contibutors[msg.sender]> 0, "must be contributor to vote");
       request storage thisRequest = requests [_requestNo];
       require (thisRequest.voters[msg.sender] == false , "you have already voted");
       thisRequest.voters[msg.sender] = true;
       thisRequest numberOfVoters ++;

}
function MoneyFlow ()


}