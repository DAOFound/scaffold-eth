// initializing the CFA Library
pragma solidity ^0.8.0;

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {ISuperfluid, ISuperfluidToken, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

contract SuperFluidTests {
    using CFAv1Library for CFAv1Library.InitData;

    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;

    ISuperToken private _token;

    constructor(ISuperfluid host, ISuperToken token) {
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

        _token = token;
    }

    //your contract code here...

    function createFlow() external {
        int96 flowRate = 10000000000000; // 25.92 dai/month
        cfaV1.createFlow(
            0xED0262718A77e09C3C8F48696791747E878a5551, // hardcoded address
            _token,
            flowRate
        );
    }

    function deleteFlow() external {
        // hardcoded values
        cfaV1.deleteFlow(
            address(this),
            0xED0262718A77e09C3C8F48696791747E878a5551,
            _token
        );
    }
}
