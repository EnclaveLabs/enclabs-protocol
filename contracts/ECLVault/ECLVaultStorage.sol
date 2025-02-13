pragma solidity ^0.5.16;

import "../Utils/SafeMath.sol";
import "../Utils/IERC20.sol";

contract ECLVaultAdminStorage {
    /**
     * @notice Administrator for this contract
     */
    address public admin;

    /**
     * @notice Pending administrator for this contract
     */
    address public pendingAdmin;

    /**
     * @notice Active brains of ECL Vault
     */
    address public implementation;

    /**
     * @notice Pending brains of ECL Vault
     */
    address public pendingECLVaultImplementation;
}

contract ECLVaultStorageV1 is ECLVaultAdminStorage {
    /// @notice Guard variable for re-entrancy checks
    bool internal _notEntered;

    /// @notice The reward token store
    address public eclStore;

    /// @notice The ecl token address
    address public eclAddress;

    // Reward tokens created per block or second indentified by reward token address.
    mapping(address => uint256) public rewardTokenAmountsPerBlockOrSecond;

    /// @notice Info of each user.
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingWithdrawals;
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 token; // Address of token contract to stake.
        uint256 allocPoint; // How many allocation points assigned to this pool.
        uint256 lastRewardBlockOrSecond; // Last block number or second that reward tokens distribution occurs.
        uint256 accRewardPerShare; // Accumulated per share, times 1e12. See below.
        uint256 lockPeriod; // Min time between withdrawal request and its execution.
    }

    // Infomation about a withdrawal request
    struct WithdrawalRequest {
        uint256 amount;
        uint128 lockedUntil;
        uint128 afterUpgrade;
    }

    // Info of each user that stakes tokens.
    mapping(address => mapping(uint256 => mapping(address => UserInfo))) internal userInfos;

    // Info of each pool.
    mapping(address => PoolInfo[]) public poolInfos;

    // Total allocation points. Must be the sum of all allocation points in all pools.
    mapping(address => uint256) public totalAllocPoints;

    // Info of requested but not yet executed withdrawals
    mapping(address => mapping(uint256 => mapping(address => WithdrawalRequest[]))) internal withdrawalRequests;

    /// @notice DEPRECATED A record of each accounts delegate (before the voting power fix)
    mapping(address => address) private __oldDelegatesSlot;

    /// @notice A checkpoint for marking number of votes from a given block or second
    struct Checkpoint {
        uint32 fromBlockOrSecond;
        uint96 votes;
    }

    /// @notice DEPRECATED A record of votes checkpoints for each account, by index (before the voting power fix)
    mapping(address => mapping(uint32 => Checkpoint)) private __oldCheckpointsSlot;

    /// @notice DEPRECATED The number of checkpoints for each account (before the voting power fix)
    mapping(address => uint32) private __oldNumCheckpointsSlot;

    /// @notice A record of states for signing / validating signatures
    mapping(address => uint) public nonces;

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

    /// @notice The EIP-712 typehash for the delegation struct used by the contract
    bytes32 public constant DELEGATION_TYPEHASH =
        keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");
}

contract ECLVaultStorage is ECLVaultStorageV1 {
    /// @notice A record of each accounts delegate
    mapping(address => address) public delegates;

    /// @notice A record of votes checkpoints for each account, by index
    mapping(address => mapping(uint32 => Checkpoint)) public checkpoints;

    /// @notice The number of checkpoints for each account
    mapping(address => uint32) public numCheckpoints;

    /// @notice Tracks pending withdrawals for all users for a particular reward token and pool id
    mapping(address => mapping(uint256 => uint256)) public totalPendingWithdrawals;

    /// @notice pause indicator for Vault
    bool public vaultPaused;

    /// @notice if the token is added to any of the pools
    mapping(address => bool) public isStakedToken;

    /// @notice Amount we owe to users because of failed transfer attempts
    mapping(address => mapping(address => uint256)) public pendingRewardTransfers;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[46] private __gap;
}