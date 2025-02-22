const LiquidDemocracy = artifacts.require("LiquidDemocracy");
const { BN, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { expect } = require('chai');
const {VNode, VGraph} = require("./Preparer.js");
const SimpleVote = artifacts.require('SimpleVote');
const LiquidVote = artifacts.require('LiquidVote');
const SimpleVoteFactory = artifacts.require('SimpleVoteFactory');
const LiquidVoteFactory = artifacts.require('LiquidVoteFactory');
const LinkCutTreeFactory = artifacts.require("LinkCutTreeFactory");

contract('TestVote', (accounts) => {

	let democracy = {};
	let vcount = 10;
	let vg = {};
	let svote = {};
	let lvote = {};

	context('init', () => {
    it('init', async() =>{
		democracy = await LiquidDemocracy.deployed();
		assert.ok(democracy)
		lctf = await LinkCutTreeFactory.deployed();
		await democracy.initLCT(lctf.address);
    vg = VGraph.createNew();
	}),


	//context("delegate", () => {

    it('test delegate graph', async() =>{
      for(i = 0; i < vcount; ++i){
        await democracy.setWeight(accounts[i], 1);
        n = VNode.createNew(accounts[i], 1, 0, 0, 0, 0, 0);
        vg.addNode(n);
        if(i != 0){
          var r = i;
          while(r == i){
            r = Math.floor(Math.random() * vcount % (i + 1));
          }
          await democracy.delegate(accounts[r], {from:accounts[i]});
          vg.addEdge(accounts[i], accounts[r]);
        }
      }

      vg.preorder();
      //console.log(vg);

      svote_factory = await SimpleVoteFactory.deployed();
      assert.ok(svote_factory);
      tokentx = await svote_factory.createSimpleVote(democracy.address, 100);
      svote = await SimpleVote.at(tokentx.logs[0].args.addr);
      assert.ok(svote);

      lvote_factory = await LiquidVoteFactory.deployed();
      assert.ok(lvote_factory);
      tokentx = await lvote_factory.createLiquidVote(democracy.address, 100, vg.merkle_root);
      lvote = await LiquidVote.at(tokentx.logs[0].args.addr);
      assert.ok(lvote);
      c = await lvote.getVoterCount();
      c = await democracy.getVoterCount(100);
    }),

      it('add choice', async() =>{
        await svote.addChoice("c1");
        await svote.addChoice("c2");
        await svote.addChoice("c3");
        await svote.addChoice("c4");

        await lvote.addChoice("c1");
        await lvote.addChoice("c2");
        await lvote.addChoice("c3");
        await lvote.addChoice("c4");
      })

      it('vote', async() =>{

        set = {}

        simple_gas = 0;
        liquid_gas = 0;
        for(i = 0; i < vcount; i++){
          r = Math.floor(Math.random() * 100)%4 + 1;
          option = "c" + String(r);
          r = Math.floor(Math.random() * 100000)%vcount;
          if(accounts[r] in set){
            //continue;
          }
          set[accounts[r]] = "in";
          const sr = await svote.voteChoice(option, {from:accounts[r]});
          simple_gas += sr.receipt.gasUsed;

          info = vg.get_voter_info(accounts[r]);

          lr = await lvote.voteChoice(option, info.stake, info.index, info.endpoint, info.leftbracket,
            info.rightbracket, info.power, info.proof_index, info.proof, {from:accounts[r]});
          liquid_gas += lr.receipt.gasUsed;


          sc1 = await svote.getChoiceVoteNumber("c1");
          sc2 = await svote.getChoiceVoteNumber("c2");
          sc3 = await svote.getChoiceVoteNumber("c3");
          sc4 = await svote.getChoiceVoteNumber("c4");
          sc1 = sc1.toNumber();
          sc2 = sc2.toNumber();
          sc3 = sc3.toNumber();
          sc4 = sc4.toNumber();

          lc1 = await lvote.getChoiceVoteNumber("c1");
          lc2 = await lvote.getChoiceVoteNumber("c2");
          lc3 = await lvote.getChoiceVoteNumber("c3");
          lc4 = await lvote.getChoiceVoteNumber("c4");
          lc1 = lc1.toNumber();
          lc2 = lc2.toNumber();
          lc3 = lc3.toNumber();
          lc4 = lc4.toNumber();

          console.log("ballots:[s1: l1] : ", sc1, lc1);
          console.log("ballots:[s2: l2] : ", sc2, lc2);
          console.log("ballots:[s3: l3] : ", sc3, lc3);
          console.log("ballots:[s4: l4] : ", sc4, lc4);
          assert.equal(sc1, lc1, "c1");
          assert.equal(sc2, lc2, "c2");
          assert.equal(sc3, lc3, "c3");
          assert.equal(sc4, lc4, "c4");
        }
        console.log("simple vote gas: ", simple_gas);
        console.log("liquid vote gas: ", liquid_gas)
          //assert.equal(1 , 2);

      }),

    it('assign', async() =>{
      total_fee = 0;
      //for(i = 0; i < accounts.length; ++i){
        //const t = await democracy.setWeight(accounts[0], 100);
      for(i = 0; i < 10; ++i){
        const t = await democracy.setWeight(accounts[i], 1);
        //console.log(t);
        const gasUsed = t.receipt.gasUsed;
        total_fee += gasUsed;
      }
      console.log('gas used: ', total_fee);
    })

		//it('delegate circle', async () => {
      //for(i = 0; i < 5; ++i){
				//await democracy.delegate(accounts[i + 1], {from:accounts[i]});
      //}
      //await expectRevert(democracy.delegate(accounts[0], {from:accounts[5]}),
        //"cannot be circle");
		//})

	})
});
