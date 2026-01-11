import {
  BlockfrostProvider,
  MeshTxBuilder,
  PlutusScript,
  serializePlutusScript,
  applyParamsToScript,
  mConStr0,
  mConStr1,
  mConStr2,
  deserializeDatum,
  resolveScriptHash,
  deserializeAddress,
} from '@meshsdk/core'
import type { BrowserWallet } from '@meshsdk/core'

// Import blueprint from public directory
let blueprint: any = null

// Load blueprint dynamically
async function loadBlueprint() {
  if (!blueprint) {
    const response = await fetch('/plutus.json')
    blueprint = await response.json()
  }
  return blueprint
}

export interface PoolConfig {
  policyId: string
  tokenName: string
  scriptAddress: string
  utxoTxHash: string
  utxoOutputIndex: number
  slope?: number
}

export interface PoolDatum {
  token_policy: string
  token_name: string
  slope: number
  current_supply: number
  creator: string
}

export class CardanoService {
  private provider: BlockfrostProvider
  private wallet: BrowserWallet | null = null

  constructor(apiKey: string) {
    this.provider = new BlockfrostProvider(apiKey)
  }

  setWallet(wallet: BrowserWallet) {
    this.wallet = wallet
  }

  /**
   * Get Pump script with parameters (từ offchain logic)
   */
  async getPumpScript(utxoTxHash: string, utxoOutputIndex: number, type: 'mint' | 'spend' = 'spend'): Promise<PlutusScript> {
    const bp = await loadBlueprint()
    const validatorTitle = type === 'mint' ? 'pump.pump.mint' : 'pump.pump.spend'
    const validator = bp.validators.find((v: any) => v.title === validatorTitle)

    if (!validator) {
      throw new Error(`${validatorTitle} validator not found`)
    }

    const scriptCbor = applyParamsToScript(validator.compiledCode, [
      utxoTxHash,
      utxoOutputIndex,
    ])

    return {
      code: scriptCbor,
      version: 'V3',
    }
  }

  /**
   * Calculate bonding curve cost (từ offchain logic)
   * Cost = Slope × (supply_end² - supply_start²) / 2
   */
  calculateCost(slope: number, supplyStart: number, supplyEnd: number): number {
    // Convert to BigInt for calculation to avoid overflow
    const slopeBig = BigInt(slope)
    const supplyStartBig = BigInt(supplyStart)
    const supplyEndBig = BigInt(supplyEnd)
    
    const endSquared = supplyEndBig * supplyEndBig
    const startSquared = supplyStartBig * supplyStartBig
    const result = (slopeBig * (endSquared - startSquared)) / BigInt(2)
    
    // Convert back to number
    return Number(result)
  }

  /**
   * Parse PoolDatum from chain data (từ offchain logic)
   */
  parsePoolDatum(datum: any): PoolDatum {
    const fields = datum.fields
    return {
      token_policy: fields[0].bytes,
      token_name: Buffer.from(fields[1].bytes, 'hex').toString('utf8'),
      slope: Number(fields[2].int), // Convert BigInt to number
      current_supply: Number(fields[3].int), // Convert BigInt to number
      creator: fields[4].bytes,
    }
  }

  /**
   * Build new PoolDatum (từ offchain logic)
   */
  buildPoolDatum(
    policyId: string,
    tokenName: string,
    slope: number,
    currentSupply: number,
    creator: string
  ) {
    return mConStr0([
      policyId,
      Buffer.from(tokenName, 'utf8').toString('hex'),
      slope,
      currentSupply,
      creator,
    ])
  }

  /**
   * Check if pool exists (từ offchain logic)
   */
  async checkPoolExists(scriptAddress: string): Promise<boolean> {
    try {
      const utxos = await this.provider.fetchAddressUTxOs(scriptAddress)
      return utxos.length > 0
    } catch (error) {
      console.error('Error checking pool existence:', error)
      return false
    }
  }

  /**
   * Get pool UTXO from script address (từ offchain logic)
   */
  async getPoolUtxo(scriptAddress: string) {
    const utxos = await this.provider.fetchAddressUTxOs(scriptAddress)
    if (utxos.length === 0) {
      throw new Error('❌ No pool UTXO found at script address. Pool chưa được tạo hoặc đã hết token.')
    }
    return utxos[0]
  }

  /**
   * Get pool data from blockchain
   */
  async getPoolData(poolConfig: PoolConfig) {
    try {
      const poolUtxo = await this.getPoolUtxo(poolConfig.scriptAddress)
      const datumCbor = poolUtxo.output.plutusData as string
      const datum = deserializeDatum(datumCbor)
      const poolDatum = this.parsePoolDatum(datum)

      // Get current balances
      const assetName = Buffer.from(poolConfig.tokenName, 'utf8').toString('hex')
      const assetId = poolConfig.policyId + assetName

      const currentAda = Number(
        poolUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
      )
      const currentTokens = Number(
        poolUtxo.output.amount.find((a: any) => a.unit === assetId)?.quantity || '0'
      )

      return {
        poolDatum,
        poolUtxo,
        currentAda,
        currentTokens,
        currentPrice: (poolDatum.slope * poolDatum.current_supply) / 1_000_000,
        marketCap: ((poolDatum.slope * poolDatum.current_supply) / 1_000_000) * poolDatum.current_supply
      }
    } catch (error) {
      console.error('Error fetching pool data:', error)
      throw error
    }
  }

  /**
   * Mint new pool and tokens (từ offchain/mint-tokens.ts)
   */
  async mintPool(tokenName: string, slope: number, totalSupply: number) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('\n🚀 Creating Pump.fun Pool with Bonding Curve...\n')

      const walletAddress = await this.wallet.getChangeAddress()
      console.log('📍 Wallet Address:', walletAddress)
      
      // Get wallet UTXOs to find one for one-shot minting
      const utxos = await this.wallet.getUtxos()
      if (utxos.length === 0) {
        throw new Error('No UTXOs available for minting')
      }

      // Select UTxO to consume (this makes it one-shot)
      const referenceUtxo = utxos[0]
      const utxoRef = {
        txHash: referenceUtxo.input.txHash,
        outputIndex: referenceUtxo.input.outputIndex
      }

      console.log('🔐 Consuming UTxO:', {
        txHash: utxoRef.txHash,
        outputIndex: utxoRef.outputIndex,
        lovelace: referenceUtxo.output.amount.find(a => a.unit === 'lovelace')?.quantity
      })

      // Get mint script
      const mintScript = await this.getPumpScript(utxoRef.txHash, utxoRef.outputIndex, 'mint')
      const policyId = resolveScriptHash(mintScript.code, 'V3')
      
      // Get spend script  
      const spendScript = await this.getPumpScript(utxoRef.txHash, utxoRef.outputIndex, 'spend')
      const { address: scriptAddress } = serializePlutusScript(spendScript, undefined, 0)

      console.log('🔑 Policy ID:', policyId)
      console.log('🏊 Pool Address (Script):', scriptAddress)

      // Define token to mint
      const assetName = Buffer.from(tokenName, 'utf8').toString('hex')
      const assetId = policyId + assetName

      console.log(`🪙 Minting ${totalSupply.toLocaleString()}x ${tokenName}...`)
      
      // Get wallet owner pubkey hash
      const ownerPubKeyHash = deserializeAddress(walletAddress).pubKeyHash
      
      // Create Pool Datum
      // PoolDatum { token_policy, token_name, slope, current_supply, creator }
      const initialSupply = 0 // Pool starts with 0 supply (nothing sold yet)
      
      const poolDatum = mConStr0([
        policyId,           // token_policy (PolicyId)
        assetName,          // token_name (ByteArray hex)
        slope,              // slope (Int)
        initialSupply,      // current_supply (Int) - starts at 0
        ownerPubKeyHash,    // creator (ByteArray)
      ])
      
      console.log('📊 Pool Configuration:')
      console.log(`   Total Supply: ${totalSupply.toLocaleString()}`)
      console.log(`   Initial Circulating: 0 (all locked in pool)`)
      console.log(`   Slope: ${slope.toLocaleString()} lovelace`)
      console.log(`   Formula: Price = ${(slope / 1_000_000)} ADA × Supply`)

      // Build transaction
      console.log('\n🔨 Building transaction...')

      const txBuilder = new MeshTxBuilder({
        fetcher: this.provider,
        submitter: this.provider,
      })

      // Mint redeemer: MintInitial (constructor 0, no fields)
      const mintRedeemer = mConStr0([])

      // Select a collateral UTxO (must be pure ADA, no tokens)
      const collateralUtxo = utxos.find(
        (u) => {
          const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace')
          const hasOnlyAda = u.output.amount.length === 1 && lovelace
          const hasEnoughAda = lovelace && Number(lovelace.quantity) >= 5000000
          return hasOnlyAda && hasEnoughAda
        }
      )
      
      if (!collateralUtxo) {
        throw new Error('No suitable collateral UTxO found (need pure ADA UTxO with at least 5 ADA)')
      }

      console.log('💰 Using collateral:', {
        txHash: collateralUtxo.input.txHash.substring(0, 16) + '...',
        lovelace: collateralUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity
      })

      // Build transaction
      const tx = await txBuilder
        // Select UTxOs from wallet
        .selectUtxosFrom(utxos)
        // Consume the required UTxO (this enables one-shot minting)
        .txIn(
          referenceUtxo.input.txHash,
          referenceUtxo.input.outputIndex,
          referenceUtxo.output.amount,
          referenceUtxo.output.address
        )
        // Mint the token
        .mintPlutusScriptV3()
        .mint(totalSupply.toString(), policyId, assetName)
        .mintingScript(mintScript.code)
        .mintRedeemerValue(mintRedeemer)
        // Add collateral
        .txInCollateral(
          collateralUtxo.input.txHash,
          collateralUtxo.input.outputIndex,
          collateralUtxo.output.amount,
          collateralUtxo.output.address
        )
        // Send all minted tokens to pool with 5 ADA minimum
        .txOut(scriptAddress, [
          { unit: 'lovelace', quantity: '5000000' },  // 5 ADA minimum
          { unit: assetId, quantity: totalSupply.toString() }  // All minted tokens
        ])
        .txOutInlineDatumValue(poolDatum)
        .changeAddress(walletAddress)
        .complete()

      console.log('✅ Transaction built successfully')

      const signedTx = await this.wallet.signTx(tx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('\n✅ SUCCESS!')
      console.log('📝 Transaction Hash:', txHash)

      return {
        policyId,
        scriptAddress,
        txHash,
        tokenName,
        slope,
        totalSupply,
        utxoTxHash: utxoRef.txHash,
        utxoOutputIndex: utxoRef.outputIndex
      }
    } catch (error) {
      console.error('Error minting pool:', error)
      throw error
    }
  }

  /**
   * Buy tokens from pool (từ offchain/buy-tokens.ts)
   */
  async buyTokens(poolConfig: PoolConfig, amount: number, maxCost: number) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('\n💰 === Buying Tokens from Pump Pool ===\n')

      const walletAddress = await this.wallet.getChangeAddress()
      console.log('📍 Buyer Address:', walletAddress)
      console.log('🎯 Amount to buy:', amount.toLocaleString())

      const poolData = await this.getPoolData(poolConfig)
      
      // Calculate cost and new supply
      const newSupply = poolData.poolDatum.current_supply + amount
      const cost = this.calculateCost(poolData.poolDatum.slope, poolData.poolDatum.current_supply, newSupply)

      console.log('\n💹 Transaction Details:')
      console.log(`   New Supply: ${newSupply.toLocaleString()}`)
      console.log(`   Cost: ${cost.toLocaleString()} lovelace (${(cost / 1_000_000).toFixed(6)} ADA)`)
      console.log(`   Average Price: ${((cost / amount) / 1_000_000).toFixed(6)} ADA per token`)

      if (cost > maxCost) {
        throw new Error('Cost exceeds maximum allowed (slippage protection)')
      }

      // Get scripts
      const spendScript = await this.getPumpScript(poolConfig.utxoTxHash, poolConfig.utxoOutputIndex, 'spend')
      
      // Build new datum
      const newDatum = this.buildPoolDatum(
        poolData.poolDatum.token_policy,
        poolData.poolDatum.token_name,
        poolData.poolDatum.slope,
        newSupply,
        poolData.poolDatum.creator
      )

      // Get wallet UTXOs
      const utxos = await this.wallet.getUtxos()
      
      // Get collateral
      const collateralUtxo = utxos.find((u) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace')
        const hasOnlyAda = u.output.amount.length === 1 && lovelace
        const hasEnoughAda = lovelace && Number(lovelace.quantity) >= 5000000
        return hasOnlyAda && hasEnoughAda
      })

      if (!collateralUtxo) {
        throw new Error('❌ No suitable collateral found (need pure ADA UTXO with ≥5 ADA)')
      }

      // Build transaction
      const txBuilder = new MeshTxBuilder({
        fetcher: this.provider,
        submitter: this.provider,
      })

      const assetName = Buffer.from(poolConfig.tokenName, 'utf8').toString('hex')
      const assetId = poolConfig.policyId + assetName

      // Buy redeemer với slippage protection
      const buyRedeemer = mConStr1([amount, maxCost])

      const tx = await txBuilder
        // Spend pool UTXO
        .spendingPlutusScriptV3()
        .txIn(
          poolData.poolUtxo.input.txHash,
          poolData.poolUtxo.input.outputIndex,
          poolData.poolUtxo.output.amount,
          poolData.poolUtxo.output.address
        )
        .txInScript(spendScript.code)
        .txInRedeemerValue(buyRedeemer)
        .txInInlineDatumPresent()
        // Add collateral
        .txInCollateral(
          collateralUtxo.input.txHash,
          collateralUtxo.input.outputIndex,
          collateralUtxo.output.amount,
          collateralUtxo.output.address
        )
        // Pool continuing output (more ADA, less tokens)
        .txOut(poolConfig.scriptAddress, [
          { unit: 'lovelace', quantity: (poolData.currentAda + cost).toString() },
          { unit: assetId, quantity: (poolData.currentTokens - amount).toString() }
        ])
        .txOutInlineDatumValue(newDatum)
        // Buyer receives tokens
        .txOut(walletAddress, [
          { unit: assetId, quantity: amount.toString() }
        ])
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete()

      console.log('✅ Transaction built')

      const signedTx = await this.wallet.signTx(tx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('\n🎉 === Purchase Successful! ===\n')
      console.log('📝 Transaction Hash:', txHash)

      return {
        txHash,
        amount,
        cost: cost / 1_000_000, // Convert to ADA
        newSupply,
        newPrice: (poolData.poolDatum.slope * newSupply) / 1_000_000
      }
    } catch (error) {
      console.error('Error buying tokens:', error)
      throw error
    }
  }

  /**
   * Sell tokens to pool (từ offchain/sell-tokens.ts)
   */
  async sellTokens(poolConfig: PoolConfig, amount: number, minRefund: number) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('\n💰 === Selling Tokens to Pump Pool ===\n')

      const walletAddress = await this.wallet.getChangeAddress()
      console.log('📍 Seller Address:', walletAddress)
      console.log(`🎯 Amount to sell: ${amount}\n`)

      const poolData = await this.getPoolData(poolConfig)
      
      // Validate có đủ supply để bán không
      if (poolData.poolDatum.current_supply < amount) {
        throw new Error(`❌ Cannot sell ${amount} tokens. Current supply is only ${poolData.poolDatum.current_supply}`)
      }

      // Calculate refund
      const refund = this.calculateCost(
        poolData.poolDatum.slope,
        poolData.poolDatum.current_supply - amount,
        poolData.poolDatum.current_supply
      )
      const newSupply = poolData.poolDatum.current_supply - amount
      const avgPrice = refund / amount / 1_000_000

      console.log('💹 Transaction Details:')
      console.log(`   New Supply: ${newSupply}`)
      console.log(`   Refund: ${refund.toLocaleString()} lovelace (${(refund / 1_000_000).toFixed(6)} ADA)`)
      console.log(`   Average Price: ${avgPrice.toFixed(6)} ADA per token\n`)

      if (refund < minRefund) {
        throw new Error('Refund below minimum allowed (slippage protection)')
      }

      // Get scripts
      const spendScript = await this.getPumpScript(poolConfig.utxoTxHash, poolConfig.utxoOutputIndex, 'spend')
      
      // Build new datum
      const newDatum = this.buildPoolDatum(
        poolData.poolDatum.token_policy,
        poolData.poolDatum.token_name,
        poolData.poolDatum.slope,
        newSupply,
        poolData.poolDatum.creator
      )

      // Get wallet UTXOs
      const utxos = await this.wallet.getUtxos()
      
      // Get collateral
      const collateralUtxo = utxos.find((u) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace')
        const hasOnlyAda = u.output.amount.length === 1 && lovelace
        const hasEnoughAda = lovelace && Number(lovelace.quantity) >= 5000000
        return hasOnlyAda && hasEnoughAda
      })

      if (!collateralUtxo) {
        throw new Error('❌ No suitable collateral found (need pure ADA UTXO with ≥5 ADA)')
      }

      // Build transaction
      console.log('🔨 Building transaction...')

      const txBuilder = new MeshTxBuilder({
        fetcher: this.provider,
        submitter: this.provider,
      })

      const assetName = Buffer.from(poolConfig.tokenName, 'utf8').toString('hex')
      const assetId = poolConfig.policyId + assetName

      // Sell redeemer với slippage protection
      const sellRedeemer = mConStr2([amount, minRefund])

      const tx = await txBuilder
        // Select UTxOs from wallet (to get tokens to sell)
        .selectUtxosFrom(utxos)
        // Spend pool UTXO
        .spendingPlutusScriptV3()
        .txIn(
          poolData.poolUtxo.input.txHash,
          poolData.poolUtxo.input.outputIndex,
          poolData.poolUtxo.output.amount,
          poolData.poolUtxo.output.address
        )
        .txInScript(spendScript.code)
        .txInRedeemerValue(sellRedeemer)
        .txInInlineDatumPresent()
        // Add collateral
        .txInCollateral(
          collateralUtxo.input.txHash,
          collateralUtxo.input.outputIndex,
          collateralUtxo.output.amount,
          collateralUtxo.output.address
        )
        // Pool continuing output (less ADA, more tokens)
        .txOut(poolConfig.scriptAddress, [
          { unit: 'lovelace', quantity: (poolData.currentAda - refund).toString() },
          { unit: assetId, quantity: (poolData.currentTokens + amount).toString() }
        ])
        .txOutInlineDatumValue(newDatum)
        // Seller receives ADA refund (handled by change)
        .changeAddress(walletAddress)
        .complete()

      console.log('✅ Transaction built')

      const signedTx = await this.wallet.signTx(tx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('\n🎉 === Sale Successful! ===\n')
      console.log('📝 Transaction Hash:', txHash)

      return {
        txHash,
        amount,
        refund: refund / 1_000_000, // Convert to ADA
        newSupply,
        newPrice: (poolData.poolDatum.slope * newSupply) / 1_000_000
      }
    } catch (error) {
      console.error('Error selling tokens:', error)
      throw error
    }
  }
}

// Export singleton instance
export const cardanoService = new CardanoService(
  process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || 'preprodNCrPaDqdsCHvUf2uYbqb67R3Z5GP5ycR'
)