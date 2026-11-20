// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PharmacyRewards {
    string public constant name = "StockGuard Rewards";
    string public constant symbol = "SGR";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    address public owner;

    struct Pharmacy {
        string name;
        uint256 points;
        uint256 claimed;
        bool exists;
    }

    mapping(address => Pharmacy) private pharmacies;
    address[] private pharmacyList;

    event PharmacyRegistered(address indexed pharmacy, string name);
    event PointsAwarded(address indexed pharmacy, uint256 points, string reason);
    event RewardClaimed(address indexed pharmacy, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerPharmacy(
        address pharmacy,
        string calldata pharmacyName
    ) external onlyOwner {
        require(pharmacy != address(0), "Invalid pharmacy address");
        require(!pharmacies[pharmacy].exists, "Pharmacy already registered");
        pharmacies[pharmacy] = Pharmacy(pharmacyName, 0, 0, true);
        pharmacyList.push(pharmacy);
        emit PharmacyRegistered(pharmacy, pharmacyName);
    }

    function awardPoints(
        address pharmacy,
        uint256 points,
        string calldata reason
    ) external onlyOwner {
        Pharmacy storage record = pharmacies[pharmacy];
        require(record.exists, "Pharmacy not registered");
        require(points > 0, "Points must be greater than zero");
        record.points += points;
        _mint(address(this), points);
        emit PointsAwarded(pharmacy, points, reason);
    }

    function claim() external {
        Pharmacy storage record = pharmacies[msg.sender];
        require(record.exists, "Pharmacy not registered");
        uint256 amount = record.points - record.claimed;
        require(amount > 0, "Nothing to claim");
        record.claimed += amount;
        _transfer(address(this), msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function getPharmacy(
        address pharmacy
    )
        external
        view
        returns (string memory pharmacyName, uint256 points, uint256 claimed, bool exists)
    {
        Pharmacy memory record = pharmacies[pharmacy];
        return (record.name, record.points, record.claimed, record.exists);
    }

    function pointsOf(address pharmacy) external view returns (uint256) {
        return pharmacies[pharmacy].points;
    }

    function claimableOf(address pharmacy) external view returns (uint256) {
        Pharmacy memory record = pharmacies[pharmacy];
        return record.points - record.claimed;
    }

    function pharmacyCount() external view returns (uint256) {
        return pharmacyList.length;
    }

    function pharmacyAt(uint256 index) external view returns (address) {
        require(index < pharmacyList.length, "Index out of range");
        return pharmacyList[index];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(to != address(0), "Invalid recipient");
        uint256 senderBalance = balanceOf[from];
        require(senderBalance >= amount, "Insufficient balance");
        unchecked {
            balanceOf[from] = senderBalance - amount;
        }
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) private {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _spendAllowance(
        address from,
        address spender,
        uint256 amount
    ) private {
        uint256 allowed = allowance[from][spender];
        require(allowed >= amount, "Insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][spender] = allowed - amount;
        }
    }
}
