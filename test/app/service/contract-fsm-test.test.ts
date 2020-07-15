import {app, assert} from 'midway-mock/bootstrap';
import {ContractEventEnum, ContractFsmRunningStatusEnum, ContractAuthStatusEnum, SubjectType} from '../../../src/enum';
import {ContractInfo} from '../../../src/interface';

describe('test/app/contract', () => {
    it('#initial-contract', async () => {
        // 取出 userService
        // const contractFsmGenerator: any = await app.applicationContext.getAsync('contractFsmGenerator');
        // const contractPolicyCompiler: any = await app.applicationContext.getAsync('contractPolicyCompiler');
        const contractEventHandler: any = await app.applicationContext.getAsync('contractEventHandler');
        const contractInfo: ContractInfo = {
            licensorId: 50020,
            licensorOwnerId: 50018,
            licensorOwnerName: 'yuliang',
            licensorName: '展品ID',
            licenseeId: 'licenseeId',
            licenseeName: '乙方名称',
            licenseeOwnerId: 20020,
            licenseeOwnerName: 'hello',
            contractType: 1,
            subjectId: '11111111',
            subjectName: '标的物',
            subjectType: SubjectType.Presentable,
            contractId: '5d2ed69f4ff8021fcc7e8772',
            contractName: '合同名称',
            // contractPolicyInfo: contractPolicyCompiler.compilePolicyText('', '策略1'),
            policyId: 'aa1',
            fsmCurrentState: 'initial',
            fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
            authStatus: ContractAuthStatusEnum.Unknown,
        };

        await contractEventHandler.emitContractEvent(ContractEventEnum.InitialContractFsmEvent, contractInfo);

        assert(true);
    });
});
